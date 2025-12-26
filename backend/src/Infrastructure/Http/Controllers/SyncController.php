<?php

namespace Src\Infrastructure\Http\Controllers;

use Illuminate\Http\Request;
use Src\Infrastructure\Persistence\Eloquent\Models\CollectionModel;
use Src\Infrastructure\Persistence\Eloquent\Models\PaymentModel;
use Src\Infrastructure\Persistence\Eloquent\Models\RateModel;
use Carbon\Carbon;

class SyncController
{
    /**
     * Pull data from server to device (online-first)
     */
    public function pull(Request $request)
    {
        $validated = $request->validate([
            'last_synced_at' => 'nullable|date',
            'device_id' => 'required|string',
            'entity_types' => 'nullable|array',
        ]);

        $lastSyncedAt = $validated['last_synced_at'] ?? null;
        $deviceId = $validated['device_id'];
        $entityTypes = $validated['entity_types'] ?? ['collections', 'payments', 'rates'];

        $data = [];

        if (in_array('collections', $entityTypes)) {
            $query = CollectionModel::query();
            if ($lastSyncedAt) {
                $query->where('updated_at', '>', $lastSyncedAt);
            }
            $data['collections'] = $query->with(['creator'])->get();
        }

        if (in_array('payments', $entityTypes)) {
            $query = PaymentModel::query();
            if ($lastSyncedAt) {
                $query->where('updated_at', '>', $lastSyncedAt);
            }
            $data['payments'] = $query->with(['collection', 'payer', 'rate'])->get();
        }

        if (in_array('rates', $entityTypes)) {
            $query = RateModel::where('is_active', true);
            if ($lastSyncedAt) {
                $query->where('updated_at', '>', $lastSyncedAt);
            }
            $data['rates'] = $query->with(['collection'])->get();
        }

        return response()->json([
            'data' => $data,
            'synced_at' => Carbon::now()->toIso8601String(),
            'has_more' => false,
        ]);
    }

    /**
     * Push data from device to server
     */
    public function push(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|string',
            'data' => 'required|array',
            'data.collections' => 'nullable|array',
            'data.payments' => 'nullable|array',
            'data.rates' => 'nullable|array',
        ]);

        $deviceId = $validated['device_id'];
        $results = [
            'collections' => [],
            'payments' => [],
            'rates' => [],
            'conflicts' => [],
        ];

        // Process collections
        if (isset($validated['data']['collections'])) {
            foreach ($validated['data']['collections'] as $collectionData) {
                try {
                    $result = $this->syncCollection($collectionData, $deviceId, $request->user()->id);
                    $results['collections'][] = $result;
                    
                    if (isset($result['conflict'])) {
                        $results['conflicts'][] = $result['conflict'];
                    }
                } catch (\Exception $e) {
                    $results['collections'][] = [
                        'uuid' => $collectionData['uuid'] ?? null,
                        'error' => $e->getMessage(),
                    ];
                }
            }
        }

        // Process payments
        if (isset($validated['data']['payments'])) {
            foreach ($validated['data']['payments'] as $paymentData) {
                try {
                    $result = $this->syncPayment($paymentData, $deviceId, $request->user()->id);
                    $results['payments'][] = $result;
                    
                    if (isset($result['conflict'])) {
                        $results['conflicts'][] = $result['conflict'];
                    }
                } catch (\Exception $e) {
                    $results['payments'][] = [
                        'uuid' => $paymentData['uuid'] ?? null,
                        'error' => $e->getMessage(),
                    ];
                }
            }
        }

        // Process rates
        if (isset($validated['data']['rates'])) {
            foreach ($validated['data']['rates'] as $rateData) {
                try {
                    $result = $this->syncRate($rateData, $deviceId, $request->user()->id);
                    $results['rates'][] = $result;
                    
                    if (isset($result['conflict'])) {
                        $results['conflicts'][] = $result['conflict'];
                    }
                } catch (\Exception $e) {
                    $results['rates'][] = [
                        'uuid' => $rateData['uuid'] ?? null,
                        'error' => $e->getMessage(),
                    ];
                }
            }
        }

        return response()->json([
            'message' => 'Sync completed',
            'synced_at' => Carbon::now()->toIso8601String(),
            'results' => $results,
        ]);
    }

    private function syncCollection(array $data, string $deviceId, int $userId): array
    {
        $existing = CollectionModel::where('uuid', $data['uuid'])->first();

        if (!$existing) {
            // Create new
            $data['created_by'] = $userId;
            $data['device_id'] = $deviceId;
            $collection = CollectionModel::create($data);
            
            return [
                'uuid' => $collection->uuid,
                'status' => 'created',
                'version' => $collection->version,
            ];
        }

        // Check for conflicts
        $incomingVersion = $data['version'] ?? 1;
        if ($existing->version > $incomingVersion) {
            return [
                'uuid' => $existing->uuid,
                'status' => 'conflict',
                'conflict' => [
                    'entity_type' => 'collection',
                    'uuid' => $existing->uuid,
                    'server_version' => $existing->version,
                    'client_version' => $incomingVersion,
                    'server_data' => $existing->toArray(),
                    'client_data' => $data,
                ],
            ];
        }

        // Update
        $data['updated_by'] = $userId;
        $data['version'] = $existing->version + 1;
        $data['synced_at'] = Carbon::now();
        $existing->update($data);

        return [
            'uuid' => $existing->uuid,
            'status' => 'updated',
            'version' => $existing->version,
        ];
    }

    private function syncPayment(array $data, string $deviceId, int $userId): array
    {
        // Check idempotency first
        if (isset($data['idempotency_key'])) {
            $existing = PaymentModel::where('idempotency_key', $data['idempotency_key'])->first();
            if ($existing) {
                return [
                    'uuid' => $existing->uuid,
                    'status' => 'exists',
                    'version' => $existing->version,
                ];
            }
        }

        $existing = PaymentModel::where('uuid', $data['uuid'])->first();

        if (!$existing) {
            // Create new
            $data['created_by'] = $userId;
            $data['device_id'] = $deviceId;
            $payment = PaymentModel::create($data);
            
            return [
                'uuid' => $payment->uuid,
                'status' => 'created',
                'version' => $payment->version,
            ];
        }

        // Check for conflicts
        $incomingVersion = $data['version'] ?? 1;
        if ($existing->version > $incomingVersion) {
            return [
                'uuid' => $existing->uuid,
                'status' => 'conflict',
                'conflict' => [
                    'entity_type' => 'payment',
                    'uuid' => $existing->uuid,
                    'server_version' => $existing->version,
                    'client_version' => $incomingVersion,
                    'server_data' => $existing->toArray(),
                    'client_data' => $data,
                ],
            ];
        }

        // Update
        $data['updated_by'] = $userId;
        $data['version'] = $existing->version + 1;
        $data['synced_at'] = Carbon::now();
        $existing->update($data);

        return [
            'uuid' => $existing->uuid,
            'status' => 'updated',
            'version' => $existing->version,
        ];
    }

    private function syncRate(array $data, string $deviceId, int $userId): array
    {
        $existing = RateModel::where('uuid', $data['uuid'])->first();

        if (!$existing) {
            // Create new
            $data['created_by'] = $userId;
            $data['device_id'] = $deviceId;
            $rate = RateModel::create($data);
            
            return [
                'uuid' => $rate->uuid,
                'status' => 'created',
                'version' => $rate->version,
            ];
        }

        // For rates, always create new version
        $newRate = $existing->replicate();
        $newRate->version = $existing->version + 1;
        $newRate->updated_by = $userId;
        
        foreach ($data as $key => $value) {
            if (!in_array($key, ['id', 'uuid', 'created_at', 'updated_at'])) {
                $newRate->{$key} = $value;
            }
        }
        
        $newRate->save();

        return [
            'uuid' => $newRate->uuid,
            'status' => 'versioned',
            'version' => $newRate->version,
        ];
    }

    public function resolveConflicts(Request $request)
    {
        $validated = $request->validate([
            'conflicts' => 'required|array',
            'conflicts.*.uuid' => 'required|string',
            'conflicts.*.resolution' => 'required|in:server_wins,client_wins,merge',
            'conflicts.*.entity_type' => 'required|in:collection,payment,rate',
            'conflicts.*.merged_data' => 'nullable|array',
        ]);

        $results = [];

        foreach ($validated['conflicts'] as $conflict) {
            $model = $this->getModelByType($conflict['entity_type']);
            $entity = $model::where('uuid', $conflict['uuid'])->first();

            if (!$entity) {
                $results[] = [
                    'uuid' => $conflict['uuid'],
                    'error' => 'Entity not found',
                ];
                continue;
            }

            switch ($conflict['resolution']) {
                case 'server_wins':
                    $results[] = [
                        'uuid' => $entity->uuid,
                        'status' => 'server_wins',
                        'data' => $entity->toArray(),
                    ];
                    break;

                case 'client_wins':
                    if (isset($conflict['merged_data'])) {
                        $entity->update($conflict['merged_data']);
                        $entity->version++;
                        $entity->save();
                    }
                    $results[] = [
                        'uuid' => $entity->uuid,
                        'status' => 'client_wins',
                        'data' => $entity->toArray(),
                    ];
                    break;

                case 'merge':
                    if (isset($conflict['merged_data'])) {
                        $entity->update($conflict['merged_data']);
                        $entity->version++;
                        $entity->save();
                    }
                    $results[] = [
                        'uuid' => $entity->uuid,
                        'status' => 'merged',
                        'data' => $entity->toArray(),
                    ];
                    break;
            }
        }

        return response()->json([
            'message' => 'Conflicts resolved',
            'results' => $results,
        ]);
    }

    public function status(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|string',
        ]);

        $deviceId = $validated['device_id'];
        $userId = $request->user()->id;

        $stats = [
            'collections' => CollectionModel::where('device_id', $deviceId)->count(),
            'payments' => PaymentModel::where('device_id', $deviceId)->count(),
            'rates' => RateModel::where('device_id', $deviceId)->count(),
            'last_sync' => [
                'collections' => CollectionModel::where('device_id', $deviceId)
                    ->max('synced_at'),
                'payments' => PaymentModel::where('device_id', $deviceId)
                    ->max('synced_at'),
                'rates' => RateModel::where('device_id', $deviceId)
                    ->max('synced_at'),
            ],
        ];

        return response()->json($stats);
    }

    private function getModelByType(string $type): string
    {
        return match($type) {
            'collection' => CollectionModel::class,
            'payment' => PaymentModel::class,
            'rate' => RateModel::class,
            default => throw new \InvalidArgumentException("Unknown entity type: {$type}"),
        };
    }
}
