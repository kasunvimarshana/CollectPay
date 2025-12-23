<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Payment;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Rate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SyncService
{
    private const ENTITY_MODELS = [
        'suppliers' => Supplier::class,
        'products' => Product::class,
        'rates' => Rate::class,
        'collections' => Collection::class,
        'payments' => Payment::class,
    ];

    /**
     * Process sync batch with conflict detection and resolution
     */
    public function processSyncBatch(array $batch, int $userId, string $deviceId): array
    {
        $results = [
            'success' => [],
            'conflicts' => [],
            'errors' => [],
        ];

        DB::beginTransaction();
        
        try {
            foreach ($batch as $item) {
                $result = $this->processSyncItem($item, $userId, $deviceId);
                
                if ($result['status'] === 'success') {
                    $results['success'][] = $result;
                } elseif ($result['status'] === 'conflict') {
                    $results['conflicts'][] = $result;
                } else {
                    $results['errors'][] = $result;
                }
            }
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync batch failed', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'device_id' => $deviceId,
            ]);
            
            throw $e;
        }

        return $results;
    }

    /**
     * Process individual sync item with optimistic locking
     */
    private function processSyncItem(array $item, int $userId, string $deviceId): array
    {
        $entityType = $item['entity_type'];
        $operation = $item['operation'];
        $data = $item['data'];
        $clientVersion = $data['version'] ?? 1;

        if (!isset(self::ENTITY_MODELS[$entityType])) {
            return [
                'status' => 'error',
                'message' => 'Invalid entity type',
                'entity_type' => $entityType,
            ];
        }

        $modelClass = self::ENTITY_MODELS[$entityType];

        try {
            switch ($operation) {
                case 'create':
                    return $this->handleCreate($modelClass, $data, $userId);
                case 'update':
                    return $this->handleUpdate($modelClass, $data, $userId, $clientVersion);
                case 'delete':
                    return $this->handleDelete($modelClass, $data, $userId, $clientVersion);
                default:
                    return [
                        'status' => 'error',
                        'message' => 'Invalid operation',
                    ];
            }
        } catch (\Exception $e) {
            Log::error('Sync item failed', [
                'entity_type' => $entityType,
                'operation' => $operation,
                'error' => $e->getMessage(),
            ]);

            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'entity_type' => $entityType,
                'operation' => $operation,
            ];
        }
    }

    /**
     * Handle create operation (idempotent using UUID)
     */
    private function handleCreate(string $modelClass, array $data, int $userId): array
    {
        // Check if already exists using UUID (for idempotency)
        if (isset($data['uuid'])) {
            $existing = $modelClass::where('uuid', $data['uuid'])->first();
            if ($existing) {
                return [
                    'status' => 'success',
                    'message' => 'Already exists (idempotent)',
                    'entity' => $existing,
                ];
            }
        }

        $data['created_by'] = $userId;
        $data['updated_by'] = $userId;
        $data['last_sync_at'] = now();
        $data['sync_status'] = 'synced';

        $entity = $modelClass::create($data);

        return [
            'status' => 'success',
            'message' => 'Created successfully',
            'entity' => $entity,
        ];
    }

    /**
     * Handle update operation with optimistic locking
     */
    private function handleUpdate(string $modelClass, array $data, int $userId, int $clientVersion): array
    {
        $identifier = $data['uuid'] ?? $data['id'] ?? null;
        
        if (!$identifier) {
            return [
                'status' => 'error',
                'message' => 'Missing identifier',
            ];
        }

        $query = isset($data['uuid']) 
            ? $modelClass::where('uuid', $identifier)
            : $modelClass::where('id', $identifier);

        $entity = $query->lockForUpdate()->first();

        if (!$entity) {
            return [
                'status' => 'error',
                'message' => 'Entity not found',
            ];
        }

        // Optimistic locking: Check version conflict
        if ($entity->version > $clientVersion) {
            return [
                'status' => 'conflict',
                'message' => 'Version conflict detected',
                'client_version' => $clientVersion,
                'server_version' => $entity->version,
                'server_data' => $entity,
                'client_data' => $data,
            ];
        }

        // Check timestamp conflict (if client data is older)
        if (isset($data['updated_at'])) {
            $clientTimestamp = Carbon::parse($data['updated_at']);
            $serverTimestamp = Carbon::parse($entity->updated_at);
            
            if ($serverTimestamp->gt($clientTimestamp)) {
                return [
                    'status' => 'conflict',
                    'message' => 'Timestamp conflict detected',
                    'server_data' => $entity,
                    'client_data' => $data,
                ];
            }
        }

        // Update entity
        unset($data['id'], $data['uuid'], $data['created_at'], $data['version']);
        $data['updated_by'] = $userId;
        $data['last_sync_at'] = now();
        $data['sync_status'] = 'synced';

        $entity->update($data);

        return [
            'status' => 'success',
            'message' => 'Updated successfully',
            'entity' => $entity->fresh(),
        ];
    }

    /**
     * Handle delete operation (soft delete)
     */
    private function handleDelete(string $modelClass, array $data, int $userId, int $clientVersion): array
    {
        $identifier = $data['uuid'] ?? $data['id'] ?? null;
        
        if (!$identifier) {
            return [
                'status' => 'error',
                'message' => 'Missing identifier',
            ];
        }

        $query = isset($data['uuid']) 
            ? $modelClass::where('uuid', $identifier)
            : $modelClass::where('id', $identifier);

        $entity = $query->first();

        if (!$entity) {
            return [
                'status' => 'success',
                'message' => 'Already deleted (idempotent)',
            ];
        }

        // Version check
        if ($entity->version > $clientVersion) {
            return [
                'status' => 'conflict',
                'message' => 'Version conflict on delete',
                'server_data' => $entity,
            ];
        }

        $entity->updated_by = $userId;
        $entity->save();
        $entity->delete();

        return [
            'status' => 'success',
            'message' => 'Deleted successfully',
        ];
    }

    /**
     * Get changes since last sync for pull synchronization
     */
    public function getChangesSince(string $entityType, ?string $lastSyncAt, ?int $userId = null): array
    {
        if (!isset(self::ENTITY_MODELS[$entityType])) {
            return [];
        }

        $modelClass = self::ENTITY_MODELS[$entityType];
        $query = $modelClass::query();

        if ($lastSyncAt) {
            $query->where('updated_at', '>', $lastSyncAt);
        }

        // Apply user-specific filters for collections and payments
        if ($userId && in_array($entityType, ['collections', 'payments'])) {
            // Collectors can only see their own data
            $query->where(function ($q) use ($userId) {
                $q->where('created_by', $userId)
                  ->orWhere('collector_id', $userId)
                  ->orWhere('processed_by', $userId);
            });
        }

        return $query->orderBy('updated_at', 'asc')
            ->limit(config('sync.batch_size', 100))
            ->get()
            ->toArray();
    }
}
