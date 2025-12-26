<?php

namespace App\Application\Sync\Services;

use App\Domain\Shared\BaseModel;
use App\Application\Sync\DTOs\SyncRequestDTO;
use App\Application\Sync\DTOs\SyncResponseDTO;
use App\Application\Sync\DTOs\ConflictDTO;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SyncService
{
    protected array $entityMap = [
        'users' => \App\Domain\User\Models\User::class,
        'suppliers' => \App\Domain\Supplier\Models\Supplier::class,
        'products' => \App\Domain\Product\Models\Product::class,
        'product_rates' => \App\Domain\Product\Models\ProductRate::class,
        'collections' => \App\Domain\Collection\Models\Collection::class,
        'payments' => \App\Domain\Payment\Models\Payment::class,
    ];

    protected string $conflictStrategy;
    protected int $batchSize;

    public function __construct()
    {
        $this->conflictStrategy = config('sync.conflict_strategy', 'server_wins');
        $this->batchSize = config('sync.batch_size', 100);
    }

    /**
     * Process incoming sync request from client
     */
    public function processSync(SyncRequestDTO $request, string $userId, string $deviceId): SyncResponseDTO
    {
        $response = new SyncResponseDTO();
        $response->syncToken = Str::uuid()->toString();
        $response->serverTime = now()->toIso8601String();

        DB::beginTransaction();

        try {
            // Validate payload integrity
            if (!$this->validatePayload($request)) {
                throw new \Exception('Invalid sync payload - integrity check failed');
            }

            // Process each entity type in priority order
            $syncOrder = config('sync.sync_priority', []);
            asort($syncOrder);

            foreach (array_keys($syncOrder) as $entityType) {
                if (!isset($request->changes[$entityType])) {
                    continue;
                }

                $entityChanges = $request->changes[$entityType];
                $result = $this->processEntityChanges(
                    $entityType,
                    $entityChanges,
                    $userId,
                    $deviceId,
                    $request->lastSyncToken
                );

                $response->processed[$entityType] = $result['processed'];
                $response->conflicts = array_merge($response->conflicts, $result['conflicts']);
                $response->errors = array_merge($response->errors, $result['errors']);
            }

            // Get server changes since last sync
            $response->serverChanges = $this->getServerChanges(
                $userId,
                $deviceId,
                $request->lastSyncToken,
                $request->lastSyncAt
            );

            // Update sync state
            $this->updateSyncState($userId, $deviceId, $response->syncToken);

            // Log sync operation
            $this->logSyncOperation($userId, $deviceId, $request, $response);

            DB::commit();

            $response->success = empty($response->errors);
            return $response;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync failed', [
                'user_id' => $userId,
                'device_id' => $deviceId,
                'error' => $e->getMessage(),
            ]);

            $response->success = false;
            $response->errors[] = $e->getMessage();
            return $response;
        }
    }

    /**
     * Process changes for a single entity type
     */
    protected function processEntityChanges(
        string $entityType,
        array $changes,
        string $userId,
        string $deviceId,
        ?string $lastSyncToken
    ): array {
        $modelClass = $this->entityMap[$entityType] ?? null;
        if (!$modelClass) {
            return ['processed' => [], 'conflicts' => [], 'errors' => ["Unknown entity type: {$entityType}"]];
        }

        $processed = [];
        $conflicts = [];
        $errors = [];

        foreach ($changes as $change) {
            try {
                $result = $this->processChange($modelClass, $change, $userId, $deviceId);
                
                if ($result['conflict']) {
                    $conflicts[] = $result['conflict'];
                } else {
                    $processed[] = $result['entity'];
                }
            } catch (\Exception $e) {
                $errors[] = [
                    'entity_id' => $change['id'] ?? 'unknown',
                    'action' => $change['action'] ?? 'unknown',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return compact('processed', 'conflicts', 'errors');
    }

    /**
     * Process a single change
     */
    protected function processChange(
        string $modelClass,
        array $change,
        string $userId,
        string $deviceId
    ): array {
        $action = $change['action'] ?? 'update';
        $data = $change['data'] ?? [];
        $clientVersion = $change['version'] ?? 1;
        $clientId = $change['client_id'] ?? null;
        $entityId = $change['id'] ?? null;

        // Check for existing record
        $existingRecord = null;
        if ($entityId) {
            $existingRecord = $modelClass::withTrashed()->find($entityId);
        }
        
        // Also check by client_id for records created offline
        if (!$existingRecord && $clientId) {
            $existingRecord = $modelClass::withTrashed()
                ->where('client_id', $clientId)
                ->first();
        }

        // Handle based on action
        switch ($action) {
            case 'create':
                return $this->handleCreate($modelClass, $data, $existingRecord, $clientId, $clientVersion);
            
            case 'update':
                return $this->handleUpdate($existingRecord, $data, $clientVersion);
            
            case 'delete':
                return $this->handleDelete($existingRecord, $clientVersion);
            
            default:
                throw new \Exception("Unknown action: {$action}");
        }
    }

    /**
     * Handle create action
     */
    protected function handleCreate(
        string $modelClass,
        array $data,
        ?BaseModel $existingRecord,
        ?string $clientId,
        int $clientVersion
    ): array {
        // If record already exists (idempotency check)
        if ($existingRecord) {
            // Check version for conflict
            if ($existingRecord->version > $clientVersion) {
                return [
                    'entity' => null,
                    'conflict' => $this->createConflict($existingRecord, $data, 'create'),
                ];
            }
            
            // Record exists and is up to date - return it
            return ['entity' => $existingRecord->getSyncData(), 'conflict' => null];
        }

        // Create new record
        $data['client_id'] = $clientId;
        $data['version'] = 1;
        $data['synced_at'] = now();
        $data['sync_status'] = 'synced';

        $entity = $modelClass::create($data);
        $entity->markAsSynced();

        return ['entity' => $entity->getSyncData(), 'conflict' => null];
    }

    /**
     * Handle update action
     */
    protected function handleUpdate(
        ?BaseModel $existingRecord,
        array $data,
        int $clientVersion
    ): array {
        if (!$existingRecord) {
            throw new \Exception('Record not found for update');
        }

        // Version conflict check
        if ($existingRecord->version > $clientVersion) {
            return [
                'entity' => null,
                'conflict' => $this->createConflict($existingRecord, $data, 'update'),
            ];
        }

        // Apply conflict resolution strategy
        if ($existingRecord->version === $clientVersion) {
            // Same version - apply client changes
            $existingRecord->fill($data);
            $existingRecord->save();
            $existingRecord->markAsSynced();
            
            return ['entity' => $existingRecord->getSyncData(), 'conflict' => null];
        }

        // Client is ahead - this shouldn't happen normally
        // Apply changes but log warning
        Log::warning('Client version ahead of server', [
            'entity' => get_class($existingRecord),
            'id' => $existingRecord->id,
            'server_version' => $existingRecord->version,
            'client_version' => $clientVersion,
        ]);

        $existingRecord->fill($data);
        $existingRecord->save();
        $existingRecord->markAsSynced();

        return ['entity' => $existingRecord->getSyncData(), 'conflict' => null];
    }

    /**
     * Handle delete action
     */
    protected function handleDelete(?BaseModel $existingRecord, int $clientVersion): array
    {
        if (!$existingRecord) {
            // Already deleted - idempotent
            return ['entity' => ['id' => null, 'deleted' => true], 'conflict' => null];
        }

        if ($existingRecord->version > $clientVersion) {
            return [
                'entity' => null,
                'conflict' => $this->createConflict($existingRecord, ['deleted' => true], 'delete'),
            ];
        }

        $existingRecord->delete();

        return ['entity' => ['id' => $existingRecord->id, 'deleted' => true], 'conflict' => null];
    }

    /**
     * Create conflict DTO
     */
    protected function createConflict(BaseModel $serverRecord, array $clientData, string $action): ConflictDTO
    {
        $conflict = new ConflictDTO();
        $conflict->entityType = class_basename($serverRecord);
        $conflict->entityId = $serverRecord->id;
        $conflict->action = $action;
        $conflict->serverVersion = $serverRecord->version;
        $conflict->serverData = $serverRecord->toArray();
        $conflict->clientData = $clientData;
        $conflict->resolution = $this->conflictStrategy;
        $conflict->resolvedData = $this->resolveConflict($serverRecord, $clientData);

        return $conflict;
    }

    /**
     * Resolve conflict based on strategy
     */
    protected function resolveConflict(BaseModel $serverRecord, array $clientData): array
    {
        return match($this->conflictStrategy) {
            'server_wins' => $serverRecord->toArray(),
            'client_wins' => $clientData,
            'latest_wins' => $this->mergeByTimestamp($serverRecord, $clientData),
            default => $serverRecord->toArray(),
        };
    }

    /**
     * Merge by timestamp - latest update wins for each field
     */
    protected function mergeByTimestamp(BaseModel $serverRecord, array $clientData): array
    {
        $serverTime = $serverRecord->updated_at;
        $clientTime = isset($clientData['updated_at']) 
            ? \Carbon\Carbon::parse($clientData['updated_at']) 
            : now();

        if ($clientTime > $serverTime) {
            return array_merge($serverRecord->toArray(), $clientData);
        }

        return $serverRecord->toArray();
    }

    /**
     * Get server changes since last sync
     */
    public function getServerChanges(
        string $userId,
        string $deviceId,
        ?string $lastSyncToken,
        ?string $lastSyncAt
    ): array {
        $changes = [];
        $syncTime = $lastSyncAt ? \Carbon\Carbon::parse($lastSyncAt) : null;

        foreach ($this->entityMap as $entityType => $modelClass) {
            $query = $modelClass::query();

            if ($syncTime) {
                $query->where(function ($q) use ($syncTime) {
                    $q->where('updated_at', '>', $syncTime)
                      ->orWhere('synced_at', '>', $syncTime);
                });
            }

            // Exclude changes made by this device (already has them)
            $query->where(function ($q) use ($deviceId) {
                $q->whereNull('client_id')
                  ->orWhere('client_id', '!=', $deviceId);
            });

            $records = $query->withTrashed()
                ->orderBy('updated_at')
                ->limit($this->batchSize)
                ->get();

            if ($records->isNotEmpty()) {
                $changes[$entityType] = $records->map(function ($record) {
                    $data = $record->getSyncData();
                    $data['deleted'] = $record->trashed();
                    return $data;
                })->toArray();
            }
        }

        return $changes;
    }

    /**
     * Validate sync payload integrity
     */
    protected function validatePayload(SyncRequestDTO $request): bool
    {
        if (empty($request->checksum)) {
            return true; // Checksum optional
        }

        $calculatedChecksum = $this->calculateChecksum($request->changes);
        return hash_equals($request->checksum, $calculatedChecksum);
    }

    /**
     * Calculate checksum for payload
     */
    public function calculateChecksum(array $data): string
    {
        $payload = json_encode($data, JSON_UNESCAPED_UNICODE);
        $key = config('sync.payload_signing_key', config('app.key'));
        return hash_hmac('sha256', $payload, $key);
    }

    /**
     * Update sync state for device
     */
    protected function updateSyncState(string $userId, string $deviceId, string $syncToken): void
    {
        foreach (array_keys($this->entityMap) as $entityType) {
            DB::table('sync_states')->updateOrInsert(
                [
                    'user_id' => $userId,
                    'device_id' => $deviceId,
                    'entity_type' => $entityType,
                ],
                [
                    'id' => Str::uuid()->toString(),
                    'last_sync_at' => now(),
                    'sync_token' => $syncToken,
                    'updated_at' => now(),
                ]
            );
        }
    }

    /**
     * Log sync operation for audit
     */
    protected function logSyncOperation(
        string $userId,
        string $deviceId,
        SyncRequestDTO $request,
        SyncResponseDTO $response
    ): void {
        if (!config('sync.enable_sync_logging', true)) {
            return;
        }

        $totalChanges = 0;
        foreach ($request->changes as $changes) {
            $totalChanges += count($changes);
        }

        Log::info('Sync completed', [
            'user_id' => $userId,
            'device_id' => $deviceId,
            'changes_received' => $totalChanges,
            'conflicts' => count($response->conflicts),
            'errors' => count($response->errors),
            'success' => $response->success,
        ]);
    }
}
