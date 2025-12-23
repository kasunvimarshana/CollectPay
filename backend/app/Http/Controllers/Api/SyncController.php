<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Payment;
use App\Models\SyncConflict;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    public function sync(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|string',
            'last_sync_timestamp' => 'nullable|date',
            'collections' => 'nullable|array',
            'collections.*.id' => 'nullable|integer',
            'collections.*.supplier_id' => 'required|integer',
            'collections.*.product_id' => 'required|integer',
            'collections.*.quantity' => 'required|numeric',
            'collections.*.unit' => 'required|in:g,kg,ml,l',
            'collections.*.rate' => 'required|numeric',
            'collections.*.collection_date' => 'required|date',
            'collections.*.version' => 'nullable|integer',
            'payments' => 'nullable|array',
            'payments.*.id' => 'nullable|integer',
            'payments.*.supplier_id' => 'required|integer',
            'payments.*.amount' => 'required|numeric',
            'payments.*.payment_type' => 'required|string',
            'payments.*.payment_method' => 'required|string',
            'payments.*.payment_date' => 'required|date',
            'payments.*.version' => 'nullable|integer',
        ]);

        DB::beginTransaction();
        try {
            $syncedCollections = [];
            $syncedPayments = [];
            $conflicts = [];

            // Sync collections
            if (isset($validated['collections'])) {
                foreach ($validated['collections'] as $collectionData) {
                    $result = $this->syncCollection($collectionData, $request->user(), $validated['device_id']);
                    if ($result['status'] === 'conflict') {
                        $conflicts[] = $result;
                    } else {
                        $syncedCollections[] = $result['data'];
                    }
                }
            }

            // Sync payments
            if (isset($validated['payments'])) {
                foreach ($validated['payments'] as $paymentData) {
                    $result = $this->syncPayment($paymentData, $request->user(), $validated['device_id']);
                    if ($result['status'] === 'conflict') {
                        $conflicts[] = $result;
                    } else {
                        $syncedPayments[] = $result['data'];
                    }
                }
            }

            // Get server updates
            $lastSync = $validated['last_sync_timestamp'] ?? null;
            $serverCollections = Collection::where('sync_status', 'synced')
                ->when($lastSync, fn($q) => $q->where('server_timestamp', '>', $lastSync))
                ->where('device_id', '!=', $validated['device_id'])
                ->with(['supplier', 'product', 'user'])
                ->get();

            $serverPayments = Payment::where('sync_status', 'synced')
                ->when($lastSync, fn($q) => $q->where('server_timestamp', '>', $lastSync))
                ->where('device_id', '!=', $validated['device_id'])
                ->with(['supplier', 'user'])
                ->get();

            DB::commit();

            return response()->json([
                'success' => true,
                'synced_collections' => $syncedCollections,
                'synced_payments' => $syncedPayments,
                'server_collections' => $serverCollections,
                'server_payments' => $serverPayments,
                'conflicts' => $conflicts,
                'sync_timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Sync failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function syncCollection(array $data, $user, string $deviceId)
    {
        $data['user_id'] = $user->id;
        $data['device_id'] = $deviceId;

        if (isset($data['id']) && $data['id']) {
            $existing = Collection::find($data['id']);
            
            if ($existing) {
                $clientVersion = $data['version'] ?? 1;
                
                if ($existing->version > $clientVersion) {
                    SyncConflict::create([
                        'entity_type' => 'collection',
                        'entity_id' => $existing->id,
                        'device_id' => $deviceId,
                        'local_data' => $data,
                        'server_data' => $existing->toArray(),
                        'conflict_type' => 'version_mismatch',
                    ]);
                    
                    return [
                        'status' => 'conflict',
                        'entity_type' => 'collection',
                        'entity_id' => $existing->id,
                        'server_data' => $existing,
                    ];
                }
                
                $existing->update($data);
                $existing->sync_status = 'synced';
                $existing->server_timestamp = now();
                $existing->save();
                
                return ['status' => 'updated', 'data' => $existing];
            }
        }

        $collection = Collection::create($data);
        $collection->sync_status = 'synced';
        $collection->server_timestamp = now();
        $collection->save();

        return ['status' => 'created', 'data' => $collection];
    }

    private function syncPayment(array $data, $user, string $deviceId)
    {
        $data['user_id'] = $user->id;
        $data['device_id'] = $deviceId;

        if (isset($data['id']) && $data['id']) {
            $existing = Payment::find($data['id']);
            
            if ($existing) {
                $clientVersion = $data['version'] ?? 1;
                
                if ($existing->version > $clientVersion) {
                    SyncConflict::create([
                        'entity_type' => 'payment',
                        'entity_id' => $existing->id,
                        'device_id' => $deviceId,
                        'local_data' => $data,
                        'server_data' => $existing->toArray(),
                        'conflict_type' => 'version_mismatch',
                    ]);
                    
                    return [
                        'status' => 'conflict',
                        'entity_type' => 'payment',
                        'entity_id' => $existing->id,
                        'server_data' => $existing,
                    ];
                }
                
                $existing->update($data);
                $existing->sync_status = 'synced';
                $existing->server_timestamp = now();
                $existing->save();
                
                return ['status' => 'updated', 'data' => $existing];
            }
        }

        $payment = Payment::create($data);
        $payment->sync_status = 'synced';
        $payment->server_timestamp = now();
        $payment->save();

        return ['status' => 'created', 'data' => $payment];
    }

    public function resolveConflict(Request $request, SyncConflict $conflict)
    {
        $validated = $request->validate([
            'resolution' => 'required|in:use_server,use_client,merge',
            'resolved_data' => 'required_if:resolution,merge|array',
        ]);

        $conflict->resolution_status = 'resolved';
        $conflict->resolved_by = $request->user()->id;
        $conflict->resolved_at = now();
        $conflict->resolved_data = $validated['resolved_data'] ?? null;
        $conflict->save();

        if ($validated['resolution'] === 'use_client' || $validated['resolution'] === 'merge') {
            $data = $validated['resolution'] === 'merge' 
                ? $validated['resolved_data'] 
                : $conflict->local_data;
            
            if ($conflict->entity_type === 'collection') {
                $entity = Collection::find($conflict->entity_id);
                $entity->update($data);
            } elseif ($conflict->entity_type === 'payment') {
                $entity = Payment::find($conflict->entity_id);
                $entity->update($data);
            }
        }

        return response()->json([
            'success' => true,
            'conflict' => $conflict,
        ]);
    }
}
