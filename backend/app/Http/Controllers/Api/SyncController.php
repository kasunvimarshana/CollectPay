<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SyncQueue;
use App\Models\Collection;
use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    public function push(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.client_uuid' => 'required|string',
            'items.*.entity_type' => 'required|in:collection,payment,supplier',
            'items.*.operation' => 'required|in:create,update,delete',
            'items.*.data' => 'required|array',
        ]);

        $deviceId = $request->header('X-Device-ID', 'unknown');
        $results = [];

        foreach ($validated['items'] as $item) {
            try {
                // Check if already synced
                $existing = SyncQueue::where('client_uuid', $item['client_uuid'])->first();
                
                if ($existing && $existing->status === 'completed') {
                    $results[] = [
                        'client_uuid' => $item['client_uuid'],
                        'status' => 'already_synced',
                        'entity_id' => $existing->entity_id,
                    ];
                    continue;
                }

                // Create sync queue item
                $syncItem = SyncQueue::create([
                    'entity_type' => $item['entity_type'],
                    'client_uuid' => $item['client_uuid'],
                    'device_id' => $deviceId,
                    'user_id' => $request->user()->id,
                    'data' => $item['data'],
                    'operation' => $item['operation'],
                    'status' => 'pending',
                ]);

                // Process immediately
                $result = $this->processSyncItem($syncItem);
                $results[] = $result;

            } catch (\Exception $e) {
                $results[] = [
                    'client_uuid' => $item['client_uuid'],
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'message' => 'Sync completed',
            'results' => $results,
        ]);
    }

    public function pull(Request $request)
    {
        $lastSync = $request->input('last_sync');
        $deviceId = $request->header('X-Device-ID');

        $collections = Collection::where('is_synced', true)
            ->when($lastSync, fn($q) => $q->where('synced_at', '>', $lastSync))
            ->when($deviceId, fn($q) => $q->where('device_id', '!=', $deviceId))
            ->with(['supplier', 'product', 'rate'])
            ->get();

        $payments = Payment::where('is_synced', true)
            ->when($lastSync, fn($q) => $q->where('synced_at', '>', $lastSync))
            ->when($deviceId, fn($q) => $q->where('device_id', '!=', $deviceId))
            ->with('supplier')
            ->get();

        $suppliers = Supplier::when($lastSync, fn($q) => $q->where('updated_at', '>', $lastSync))
            ->with('balance')
            ->get();

        $productRates = \App\Models\ProductRate::where('is_current', true)
            ->with('product')
            ->get();

        return response()->json([
            'collections' => $collections,
            'payments' => $payments,
            'suppliers' => $suppliers,
            'product_rates' => $productRates,
            'sync_time' => now()->toIso8601String(),
        ]);
    }

    public function status(Request $request)
    {
        $pending = SyncQueue::where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->count();

        $conflicts = SyncQueue::where('user_id', $request->user()->id)
            ->where('status', 'conflict')
            ->count();

        $failed = SyncQueue::where('user_id', $request->user()->id)
            ->where('status', 'failed')
            ->count();

        return response()->json([
            'pending' => $pending,
            'conflicts' => $conflicts,
            'failed' => $failed,
        ]);
    }

    public function conflicts(Request $request)
    {
        $conflicts = SyncQueue::where('user_id', $request->user()->id)
            ->where('status', 'conflict')
            ->with('user')
            ->get();

        return response()->json($conflicts);
    }

    public function resolveConflict(Request $request, SyncQueue $syncQueue)
    {
        $request->validate([
            'resolution' => 'required|in:use_server,use_client,merge',
            'merged_data' => 'required_if:resolution,merge|array',
        ]);

        if ($syncQueue->status !== 'conflict') {
            return response()->json(['message' => 'Item is not in conflict'], 422);
        }

        try {
            DB::beginTransaction();

            if ($request->resolution === 'use_server') {
                // Keep server data, mark as processed
                $syncQueue->markAsProcessed($syncQueue->conflict_data['server_entity_id'] ?? null);
            } else if ($request->resolution === 'use_client') {
                // Use client data
                $syncQueue->data = $syncQueue->data;
                $syncQueue->status = 'pending';
                $syncQueue->save();
                $result = $this->processSyncItem($syncQueue);
            } else {
                // Use merged data
                $syncQueue->data = $request->merged_data;
                $syncQueue->status = 'pending';
                $syncQueue->save();
                $result = $this->processSyncItem($syncQueue);
            }

            DB::commit();

            return response()->json(['message' => 'Conflict resolved successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to resolve conflict', 'error' => $e->getMessage()], 500);
        }
    }

    private function processSyncItem(SyncQueue $syncItem): array
    {
        try {
            DB::beginTransaction();

            $entityId = null;

            switch ($syncItem->entity_type) {
                case 'collection':
                    $entityId = $this->processCollection($syncItem);
                    break;
                case 'payment':
                    $entityId = $this->processPayment($syncItem);
                    break;
                case 'supplier':
                    $entityId = $this->processSupplier($syncItem);
                    break;
            }

            $syncItem->markAsProcessed($entityId);

            DB::commit();

            return [
                'client_uuid' => $syncItem->client_uuid,
                'status' => 'success',
                'entity_id' => $entityId,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            $syncItem->markAsFailed($e->getMessage());

            return [
                'client_uuid' => $syncItem->client_uuid,
                'status' => 'failed',
                'message' => $e->getMessage(),
            ];
        }
    }

    private function processCollection(SyncQueue $syncItem): int
    {
        $data = $syncItem->data;

        if ($syncItem->operation === 'create') {
            $collection = Collection::create([
                'supplier_id' => $data['supplier_id'],
                'product_id' => $data['product_id'],
                'collector_id' => $syncItem->user_id,
                'quantity' => $data['quantity'],
                'unit' => $data['unit'],
                'rate_id' => $data['rate_id'],
                'rate_applied' => $data['rate_applied'],
                'collected_at' => $data['collected_at'],
                'notes' => $data['notes'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'client_uuid' => $syncItem->client_uuid,
                'device_id' => $syncItem->device_id,
                'is_synced' => true,
                'synced_at' => now(),
            ]);

            $collection->supplier->balance?->recalculate();

            return $collection->id;
        }

        return 0;
    }

    private function processPayment(SyncQueue $syncItem): int
    {
        $data = $syncItem->data;

        if ($syncItem->operation === 'create') {
            $payment = Payment::create([
                'supplier_id' => $data['supplier_id'],
                'payment_type' => $data['payment_type'],
                'amount' => $data['amount'],
                'payment_date' => $data['payment_date'],
                'payment_method' => $data['payment_method'] ?? 'cash',
                'reference_number' => $data['reference_number'] ?? null,
                'notes' => $data['notes'] ?? null,
                'processed_by' => $syncItem->user_id,
                'client_uuid' => $syncItem->client_uuid,
                'device_id' => $syncItem->device_id,
                'is_synced' => true,
                'synced_at' => now(),
            ]);

            $payment->supplier->balance?->recalculate();

            return $payment->id;
        }

        return 0;
    }

    private function processSupplier(SyncQueue $syncItem): int
    {
        $data = $syncItem->data;

        if ($syncItem->operation === 'create') {
            $supplier = Supplier::create([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'secondary_phone' => $data['secondary_phone'] ?? null,
                'address' => $data['address'] ?? null,
                'village' => $data['village'] ?? null,
                'district' => $data['district'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'created_by' => $syncItem->user_id,
            ]);

            \App\Models\SupplierBalance::create(['supplier_id' => $supplier->id]);

            return $supplier->id;
        }

        return 0;
    }
}
