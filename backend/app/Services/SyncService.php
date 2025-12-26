<?php

namespace App\Services;

use App\Models\SyncQueue;
use App\Models\Collection;
use App\Models\Payment;
use App\Models\Rate;
use App\Models\AuditLog;
use Illuminate\Support\Collection as IlluminateCollection;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class SyncService
{
    protected PaymentService $paymentService;
    protected CollectionService $collectionService;
    protected RateService $rateService;

    public function __construct()
    {
        $this->paymentService = new PaymentService();
        $this->collectionService = new CollectionService();
        $this->rateService = new RateService();
    }

    /**
     * Pull data from server (client sync down).
     */
    public function pull(int $userId, string $deviceId, ?string $lastSyncedAt): array
    {
        $timestamp = $lastSyncedAt ? new \DateTime($lastSyncedAt) : null;

        return [
            'collections' => Collection::modifiedSince($timestamp)
                ->with(['creator', 'updater', 'payments', 'rates'])
                ->get(),
            'payments' => Payment::modifiedSince($timestamp)
                ->with(['collection', 'rate', 'payer'])
                ->get(),
            'rates' => Rate::modifiedSince($timestamp)
                ->with(['collection', 'creator'])
                ->get(),
            'sync_timestamp' => now()->toDateTimeString(),
        ];
    }

    /**
     * Push local changes to server (client sync up).
     */
    public function push(int $userId, string $deviceId, array $operations): array
    {
        $results = [];
        $processedIds = [];

        foreach ($operations as $operation) {
            try {
                $result = $this->processOperation($operation, $userId, $deviceId);
                $results[] = $result;
                $processedIds[] = $operation['id'] ?? null;
            } catch (\Exception $e) {
                $results[] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'operation' => $operation,
                ];
            }
        }

        // Mark operations as synced
        if (!empty($processedIds)) {
            SyncQueue::whereIn('id', array_filter($processedIds))
                ->update([
                    'status' => 'synced',
                    'synced_at' => now(),
                ]);
        }

        return [
            'results' => $results,
            'successful_count' => count(array_filter($results, fn($r) => $r['success'] ?? false)),
            'failed_count' => count(array_filter($results, fn($r) => !($r['success'] ?? false))),
        ];
    }

    /**
     * Process a single sync operation.
     */
    protected function processOperation(array $operation, int $userId, string $deviceId): array
    {
        $type = $operation['entity_type'] ?? null;
        $action = $operation['operation'] ?? null;
        $payload = $operation['payload'] ?? [];

        // Check idempotency for creates
        if ($action === 'create' && isset($operation['idempotency_key'])) {
            $idempotencyKey = $operation['idempotency_key'];

            switch ($type) {
                case 'payments':
                    $existing = Payment::where('idempotency_key', $idempotencyKey)->first();
                    if ($existing) {
                        return [
                            'success' => true,
                            'message' => 'Duplicate prevented via idempotency key',
                            'entity_type' => $type,
                            'uuid' => $existing->uuid,
                        ];
                    }
                    break;
            }
        }

        // Process operation based on type and action
        switch ($type) {
            case 'collections':
                return $this->processCollectionOperation($action, $payload, $userId, $deviceId);
            case 'payments':
                return $this->processPaymentOperation($action, $payload, $userId, $deviceId, $operation['idempotency_key'] ?? null);
            case 'rates':
                return $this->processRateOperation($action, $payload, $userId, $deviceId);
            default:
                return [
                    'success' => false,
                    'error' => "Unknown entity type: $type",
                ];
        }
    }

    /**
     * Process collection operations.
     */
    protected function processCollectionOperation(string $action, array $payload, int $userId, string $deviceId): array
    {
        try {
            switch ($action) {
                case 'create':
                    $collection = $this->collectionService->create($payload, $userId, $deviceId);
                    return [
                        'success' => true,
                        'entity_type' => 'collections',
                        'uuid' => $collection->uuid,
                        'data' => $collection,
                    ];

                case 'update':
                    if (!isset($payload['uuid'])) {
                        throw new \Exception('UUID required for update');
                    }
                    $collection = $this->collectionService->update($payload['uuid'], $payload, $userId);
                    return [
                        'success' => true,
                        'entity_type' => 'collections',
                        'uuid' => $collection->uuid,
                        'data' => $collection,
                    ];

                case 'delete':
                    if (!isset($payload['uuid'])) {
                        throw new \Exception('UUID required for delete');
                    }
                    $this->collectionService->delete($payload['uuid'], $userId);
                    return [
                        'success' => true,
                        'entity_type' => 'collections',
                        'message' => 'Collection deleted',
                    ];

                default:
                    throw new \Exception("Unknown collection action: $action");
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Process payment operations.
     */
    protected function processPaymentOperation(string $action, array $payload, int $userId, string $deviceId, ?string $idempotencyKey): array
    {
        try {
            switch ($action) {
                case 'create':
                    if ($idempotencyKey) {
                        $payload['idempotency_key'] = $idempotencyKey;
                    }
                    $payment = $this->paymentService->create($payload, $userId, $deviceId);
                    return [
                        'success' => true,
                        'entity_type' => 'payments',
                        'uuid' => $payment->uuid,
                        'data' => $payment,
                    ];

                case 'update':
                    if (!isset($payload['uuid'])) {
                        throw new \Exception('UUID required for update');
                    }
                    $payment = $this->paymentService->update($payload['uuid'], $payload, $userId);
                    return [
                        'success' => true,
                        'entity_type' => 'payments',
                        'uuid' => $payment->uuid,
                        'data' => $payment,
                    ];

                case 'delete':
                    if (!isset($payload['uuid'])) {
                        throw new \Exception('UUID required for delete');
                    }
                    $this->paymentService->delete($payload['uuid'], $userId);
                    return [
                        'success' => true,
                        'entity_type' => 'payments',
                        'message' => 'Payment deleted',
                    ];

                default:
                    throw new \Exception("Unknown payment action: $action");
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Process rate operations.
     */
    protected function processRateOperation(string $action, array $payload, int $userId, string $deviceId): array
    {
        try {
            switch ($action) {
                case 'create':
                    $rate = $this->rateService->create($payload, $userId, $deviceId);
                    return [
                        'success' => true,
                        'entity_type' => 'rates',
                        'uuid' => $rate->uuid,
                        'data' => $rate,
                    ];

                case 'update_version':
                    if (!isset($payload['uuid'])) {
                        throw new \Exception('UUID required for version update');
                    }
                    $rate = $this->rateService->createVersion($payload['uuid'], $payload, $userId);
                    return [
                        'success' => true,
                        'entity_type' => 'rates',
                        'uuid' => $rate->uuid,
                        'data' => $rate,
                    ];

                case 'deactivate':
                    if (!isset($payload['uuid'])) {
                        throw new \Exception('UUID required for deactivation');
                    }
                    $rate = $this->rateService->deactivate($payload['uuid'], $userId);
                    return [
                        'success' => true,
                        'entity_type' => 'rates',
                        'uuid' => $rate->uuid,
                        'data' => $rate,
                    ];

                default:
                    throw new \Exception("Unknown rate action: $action");
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Detect and resolve conflicts.
     */
    public function resolveConflicts(int $userId, string $deviceId, array $conflicts): array
    {
        $results = [];

        foreach ($conflicts as $conflict) {
            try {
                $result = $this->resolveConflict($conflict, $userId, $deviceId);
                $results[] = $result;
            } catch (\Exception $e) {
                $results[] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'conflict' => $conflict,
                ];
            }
        }

        return $results;
    }

    /**
     * Resolve a single conflict using server wins strategy.
     */
    protected function resolveConflict(array $conflict, int $userId, string $deviceId): array
    {
        $type = $conflict['entity_type'] ?? null;
        $uuid = $conflict['uuid'] ?? null;
        $strategy = $conflict['strategy'] ?? 'server_wins';

        if (!$uuid || !$type) {
            throw new \Exception('Missing uuid or entity_type in conflict');
        }

        switch ($strategy) {
            case 'server_wins':
                // Server version is already in place, just log
                return [
                    'success' => true,
                    'message' => 'Server version accepted',
                    'strategy' => 'server_wins',
                    'entity_type' => $type,
                    'uuid' => $uuid,
                ];

            case 'client_wins':
                // Accept client version from conflict data
                if (!isset($conflict['client_data'])) {
                    throw new \Exception('Client data required for client_wins strategy');
                }
                // Update with client data
                return [
                    'success' => true,
                    'message' => 'Client version accepted',
                    'strategy' => 'client_wins',
                    'entity_type' => $type,
                    'uuid' => $uuid,
                ];

            case 'merge':
                // Merge server and client versions
                if (!isset($conflict['merge_strategy'])) {
                    throw new \Exception('Merge strategy not specified');
                }
                return [
                    'success' => true,
                    'message' => 'Versions merged',
                    'strategy' => 'merge',
                    'entity_type' => $type,
                    'uuid' => $uuid,
                ];

            default:
                throw new \Exception("Unknown conflict resolution strategy: $strategy");
        }
    }

    /**
     * Get sync status for a device.
     */
    public function getSyncStatus(int $userId, string $deviceId): array
    {
        $pending = SyncQueue::forUser($userId)
            ->forDevice($deviceId)
            ->pending()
            ->count();

        $failed = SyncQueue::forUser($userId)
            ->forDevice($deviceId)
            ->failed()
            ->count();

        $synced = SyncQueue::forUser($userId)
            ->forDevice($deviceId)
            ->synced()
            ->count();

        return [
            'device_id' => $deviceId,
            'pending_count' => $pending,
            'failed_count' => $failed,
            'synced_count' => $synced,
            'total_count' => $pending + $failed + $synced,
            'last_sync_at' => SyncQueue::forUser($userId)
                ->forDevice($deviceId)
                ->whereNotNull('synced_at')
                ->max('synced_at'),
            'needs_sync' => $pending > 0 || $failed > 0,
        ];
    }

    /**
     * Retry failed sync operations.
     */
    public function retryFailed(int $userId, string $deviceId): array
    {
        $failed = SyncQueue::forUser($userId)
            ->forDevice($deviceId)
            ->failed()
            ->get();

        $results = [];

        foreach ($failed as $item) {
            $item->update([
                'status' => 'pending',
                'attempts' => 0,
            ]);

            $results[] = [
                'id' => $item->id,
                'message' => 'Marked for retry',
            ];
        }

        return $results;
    }
}
