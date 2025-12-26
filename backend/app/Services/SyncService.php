<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Payment;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Rate;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SyncService
{
    private const BATCH_SIZE = 100;

    /**
     * Process incoming sync data from client
     */
    public function processSyncBatch(array $syncData, User $user, string $deviceId): array
    {
        $results = [
            'success' => [],
            'failed' => [],
            'conflicts' => [],
        ];

        DB::beginTransaction();
        try {
            foreach ($syncData as $item) {
                try {
                    $result = $this->processSyncItem($item, $user, $deviceId);
                    
                    if ($result['status'] === 'conflict') {
                        $results['conflicts'][] = $result;
                    } else {
                        $results['success'][] = $result;
                    }
                } catch (\Exception $e) {
                    Log::error('Sync item failed', [
                        'item' => $item,
                        'error' => $e->getMessage(),
                    ]);
                    
                    $results['failed'][] = [
                        'item' => $item,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return $results;
    }

    /**
     * Process a single sync item
     */
    private function processSyncItem(array $item, User $user, string $deviceId): array
    {
        $entityType = $item['entity_type'];
        $operation = $item['operation'];
        $data = $item['data'];
        $clientVersion = $item['version'] ?? 1;

        // Check for conflicts
        if ($operation === 'update' || $operation === 'delete') {
            $conflict = $this->detectConflict($entityType, $data['id'] ?? null, $clientVersion);
            if ($conflict) {
                return [
                    'status' => 'conflict',
                    'entity_type' => $entityType,
                    'client_data' => $data,
                    'server_data' => $conflict,
                ];
            }
        }

        // Process based on entity type and operation
        $result = match ($entityType) {
            'supplier' => $this->syncSupplier($operation, $data, $user),
            'product' => $this->syncProduct($operation, $data, $user),
            'rate' => $this->syncRate($operation, $data, $user),
            'collection' => $this->syncCollection($operation, $data, $user),
            'payment' => $this->syncPayment($operation, $data, $user),
            default => throw new \Exception("Unknown entity type: {$entityType}"),
        };

        return [
            'status' => 'success',
            'entity_type' => $entityType,
            'operation' => $operation,
            'data' => $result,
        ];
    }

    /**
     * Detect conflicts based on version numbers and timestamps
     */
    private function detectConflict(string $entityType, ?int $id, int $clientVersion): ?array
    {
        if (!$id) {
            return null;
        }

        $model = match ($entityType) {
            'supplier' => Supplier::find($id),
            'product' => Product::find($id),
            'rate' => Rate::find($id),
            'collection' => Collection::find($id),
            'payment' => Payment::find($id),
            default => null,
        };

        if (!$model) {
            return null;
        }

        // Check version mismatch
        if ($model->version > $clientVersion) {
            return [
                'id' => $model->id,
                'version' => $model->version,
                'updated_at' => $model->updated_at->toIso8601String(),
                'data' => $model->toArray(),
            ];
        }

        return null;
    }

    /**
     * Sync supplier
     */
    private function syncSupplier(string $operation, array $data, User $user): array
    {
        return match ($operation) {
            'create' => $this->createOrUpdateByUuid(Supplier::class, $data),
            'update' => $this->updateEntity(Supplier::class, $data),
            'delete' => $this->deleteEntity(Supplier::class, $data['id']),
            default => throw new \Exception("Unknown operation: {$operation}"),
        };
    }

    /**
     * Sync product
     */
    private function syncProduct(string $operation, array $data, User $user): array
    {
        return match ($operation) {
            'create' => $this->createOrUpdateByUuid(Product::class, $data),
            'update' => $this->updateEntity(Product::class, $data),
            'delete' => $this->deleteEntity(Product::class, $data['id']),
            default => throw new \Exception("Unknown operation: {$operation}"),
        };
    }

    /**
     * Sync rate
     */
    private function syncRate(string $operation, array $data, User $user): array
    {
        return match ($operation) {
            'create' => $this->createEntity(Rate::class, $data),
            'update' => $this->updateEntity(Rate::class, $data),
            'delete' => $this->deleteEntity(Rate::class, $data['id']),
            default => throw new \Exception("Unknown operation: {$operation}"),
        };
    }

    /**
     * Sync collection
     */
    private function syncCollection(string $operation, array $data, User $user): array
    {
        if ($operation === 'create') {
            // Check for duplicate UUID (idempotency)
            $existing = Collection::where('uuid', $data['uuid'])->first();
            if ($existing) {
                return $existing->toArray();
            }
        }

        return match ($operation) {
            'create' => $this->createEntity(Collection::class, $data),
            'update' => $this->updateEntity(Collection::class, $data),
            'delete' => $this->deleteEntity(Collection::class, $data['id']),
            default => throw new \Exception("Unknown operation: {$operation}"),
        };
    }

    /**
     * Sync payment
     */
    private function syncPayment(string $operation, array $data, User $user): array
    {
        if ($operation === 'create') {
            // Check for duplicate UUID (idempotency)
            $existing = Payment::where('uuid', $data['uuid'])->first();
            if ($existing) {
                return $existing->toArray();
            }
        }

        return match ($operation) {
            'create' => $this->createEntity(Payment::class, $data),
            'update' => $this->updateEntity(Payment::class, $data),
            'delete' => $this->deleteEntity(Payment::class, $data['id']),
            default => throw new \Exception("Unknown operation: {$operation}"),
        };
    }

    /**
     * Create or update entity by UUID (for idempotent creates)
     */
    private function createOrUpdateByUuid(string $modelClass, array $data): array
    {
        $model = $modelClass::updateOrCreate(
            ['code' => $data['code']],
            $data
        );

        return $model->fresh()->toArray();
    }

    /**
     * Create entity
     */
    private function createEntity(string $modelClass, array $data): array
    {
        $model = $modelClass::create($data);
        return $model->fresh()->toArray();
    }

    /**
     * Update entity
     */
    private function updateEntity(string $modelClass, array $data): array
    {
        $model = $modelClass::findOrFail($data['id']);
        $model->update($data);
        return $model->fresh()->toArray();
    }

    /**
     * Delete entity
     */
    private function deleteEntity(string $modelClass, int $id): array
    {
        $model = $modelClass::findOrFail($id);
        $model->delete();
        return ['id' => $id, 'deleted' => true];
    }

    /**
     * Get changes since last sync
     */
    public function getChangesSince(string $timestamp, User $user): array
    {
        $since = \Carbon\Carbon::parse($timestamp);

        return [
            'suppliers' => Supplier::where('updated_at', '>', $since)->get(),
            'products' => Product::where('updated_at', '>', $since)->get(),
            'rates' => Rate::where('updated_at', '>', $since)->get(),
            'collections' => Collection::where('updated_at', '>', $since)->get(),
            'payments' => Payment::where('updated_at', '>', $since)->get(),
            'timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * Get full sync data for initial sync
     */
    public function getFullSyncData(User $user): array
    {
        return [
            'suppliers' => Supplier::all(),
            'products' => Product::where('is_active', true)->get(),
            'rates' => Rate::where('is_active', true)->get(),
            'collections' => Collection::where('created_by', $user->id)
                ->orWhere('collected_by', $user->id)
                ->get(),
            'payments' => Payment::where('created_by', $user->id)
                ->orWhere('processed_by', $user->id)
                ->get(),
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
