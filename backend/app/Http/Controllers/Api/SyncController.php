<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    /**
     * Sync collections from mobile device
     */
    public function syncCollections(Request $request)
    {
        $validated = $request->validate([
            'collections' => 'required|array',
            'collections.*.client_id' => 'required|string|uuid',
            'collections.*.supplier_id' => 'required|exists:suppliers,id',
            'collections.*.product_id' => 'required|exists:products,id',
            'collections.*.quantity' => 'required|numeric|min:0.001',
            'collections.*.unit' => 'required|string',
            'collections.*.rate' => 'required|numeric|min:0',
            'collections.*.amount' => 'required|numeric|min:0',
            'collections.*.collection_date' => 'required|date',
            'collections.*.notes' => 'nullable|string',
            'collections.*.metadata' => 'nullable|array',
            'collections.*.version' => 'required|integer',
        ]);

        $results = [];
        $userId = $request->user()->id;

        DB::beginTransaction();
        try {
            foreach ($validated['collections'] as $collectionData) {
                $clientId = $collectionData['client_id'];
                
                // Check if collection already exists
                $existing = Collection::where('client_id', $clientId)->first();

                if ($existing) {
                    // Handle conflict resolution
                    if ($existing->version >= $collectionData['version']) {
                        $results[] = [
                            'client_id' => $clientId,
                            'status' => 'conflict',
                            'message' => 'Server version is newer or equal',
                            'server_data' => $existing,
                        ];
                        continue;
                    }

                    // Update existing collection
                    $existing->update(array_merge($collectionData, [
                        'user_id' => $userId,
                        'synced_at' => now(),
                    ]));
                    
                    $results[] = [
                        'client_id' => $clientId,
                        'status' => 'updated',
                        'id' => $existing->id,
                    ];
                } else {
                    // Create new collection
                    $collection = Collection::create(array_merge($collectionData, [
                        'user_id' => $userId,
                        'synced_at' => now(),
                    ]));
                    
                    $results[] = [
                        'client_id' => $clientId,
                        'status' => 'created',
                        'id' => $collection->id,
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Sync completed',
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Sync failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync payments from mobile device
     */
    public function syncPayments(Request $request)
    {
        $validated = $request->validate([
            'payments' => 'required|array',
            'payments.*.client_id' => 'required|string|uuid',
            'payments.*.supplier_id' => 'required|exists:suppliers,id',
            'payments.*.collection_id' => 'nullable|exists:collections,id',
            'payments.*.payment_type' => 'required|string|in:advance,partial,full',
            'payments.*.amount' => 'required|numeric|min:0.01',
            'payments.*.payment_date' => 'required|date',
            'payments.*.payment_method' => 'nullable|string',
            'payments.*.reference_number' => 'nullable|string',
            'payments.*.notes' => 'nullable|string',
            'payments.*.metadata' => 'nullable|array',
            'payments.*.version' => 'required|integer',
        ]);

        $results = [];
        $userId = $request->user()->id;

        DB::beginTransaction();
        try {
            foreach ($validated['payments'] as $paymentData) {
                $clientId = $paymentData['client_id'];
                
                // Check if payment already exists
                $existing = Payment::where('client_id', $clientId)->first();

                if ($existing) {
                    // Handle conflict resolution
                    if ($existing->version >= $paymentData['version']) {
                        $results[] = [
                            'client_id' => $clientId,
                            'status' => 'conflict',
                            'message' => 'Server version is newer or equal',
                            'server_data' => $existing,
                        ];
                        continue;
                    }

                    // Update existing payment
                    $existing->update(array_merge($paymentData, [
                        'user_id' => $userId,
                        'synced_at' => now(),
                    ]));
                    
                    $results[] = [
                        'client_id' => $clientId,
                        'status' => 'updated',
                        'id' => $existing->id,
                    ];
                } else {
                    // Create new payment
                    $payment = Payment::create(array_merge($paymentData, [
                        'user_id' => $userId,
                        'synced_at' => now(),
                    ]));
                    
                    $results[] = [
                        'client_id' => $clientId,
                        'status' => 'created',
                        'id' => $payment->id,
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Sync completed',
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Sync failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get updates from server since last sync
     */
    public function getUpdates(Request $request)
    {
        $validated = $request->validate([
            'last_sync' => 'required|date',
        ]);

        $lastSync = $validated['last_sync'];
        $userId = $request->user()->id;

        $collections = Collection::where('user_id', $userId)
            ->where('updated_at', '>', $lastSync)
            ->with(['supplier', 'product'])
            ->get();

        $payments = Payment::where('user_id', $userId)
            ->where('updated_at', '>', $lastSync)
            ->with(['supplier', 'collection'])
            ->get();

        return response()->json([
            'collections' => $collections,
            'payments' => $payments,
            'sync_time' => now()->toIso8601String(),
        ]);
    }
}
