<?php

namespace App\Infrastructure\Sync;

use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Domain\Services\AuditServiceInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Sync Service
 *
 * Handles synchronization of offline data from mobile devices.
 * Implements conflict detection and resolution strategies.
 * Ensures data integrity across multiple users and devices.
 * Follows Clean Architecture by using repository and service interfaces.
 */
class SyncService
{
    private SupplierRepositoryInterface $supplierRepository;

    private AuditServiceInterface $auditService;

    public function __construct(
        SupplierRepositoryInterface $supplierRepository,
        AuditServiceInterface $auditService
    ) {
        $this->supplierRepository = $supplierRepository;
        $this->auditService = $auditService;
    }

    /**
     * Sync suppliers from mobile device
     *
     * @param  array  $suppliers  Array of supplier data from mobile device
     * @param  int  $userId  User ID performing the sync
     * @return array Sync result with conflicts and successes
     */
    public function syncSuppliers(array $suppliers, int $userId): array
    {
        $results = [
            'success' => [],
            'conflicts' => [],
            'errors' => [],
        ];

        DB::beginTransaction();

        try {
            foreach ($suppliers as $supplierData) {
                $result = $this->syncSingleSupplier($supplierData, $userId);

                if ($result['status'] === 'success') {
                    $results['success'][] = $result;
                } elseif ($result['status'] === 'conflict') {
                    $results['conflicts'][] = $result;
                } else {
                    $results['errors'][] = $result;
                }
            }

            DB::commit();

            Log::info('Sync completed', [
                'user_id' => $userId,
                'success_count' => count($results['success']),
                'conflict_count' => count($results['conflicts']),
                'error_count' => count($results['errors']),
            ]);

            return $results;
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Sync failed', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            throw new \RuntimeException('Sync operation failed: '.$e->getMessage(), 0, $e);
        }
    }

    /**
     * Sync a single supplier with conflict detection
     *
     * @param  array  $data  Supplier data from mobile device
     * @param  int  $userId  User ID
     * @return array Sync result
     */
    private function syncSingleSupplier(array $data, int $userId): array
    {
        // Extract sync metadata
        $localId = $data['local_id'] ?? null;
        $serverId = $data['id'] ?? null;
        $clientVersion = $data['version'] ?? 1;
        $lastSyncedAt = $data['last_synced_at'] ?? null;

        try {
            if ($serverId !== null) {
                // Update existing supplier
                return $this->updateExistingSupplier($serverId, $data, $clientVersion, $userId);
            } else {
                // Create new supplier
                return $this->createNewSupplier($data, $localId, $userId);
            }
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'local_id' => $localId,
                'server_id' => $serverId,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create new supplier from mobile data
     */
    private function createNewSupplier(array $data, ?string $localId, int $userId): array
    {
        // Generate unique code using timestamp and random component to avoid race conditions
        $code = $data['code'] ?? 'SUP'.time().rand(1000, 9999);

        // Create domain entity
        $entity = new \App\Domain\Entities\SupplierEntity(
            name: $data['name'],
            code: $code,
            contactPerson: $data['contact_person'] ?? null,
            phone: $data['phone'] ?? null,
            email: $data['email'] ?? null,
            address: $data['address'] ?? null,
            city: $data['city'] ?? null,
            state: $data['state'] ?? null,
            country: $data['country'] ?? null,
            postalCode: $data['postal_code'] ?? null,
            status: $data['status'] ?? 'active'
        );

        // Save through repository (Clean Architecture)
        $savedEntity = $this->supplierRepository->save($entity);

        // Audit logging through service interface (Clean Architecture)
        $this->auditService->log(
            'create',
            'Supplier',
            $savedEntity->getId(),
            null,
            $savedEntity->toArray(),
            'Supplier created via sync',
            $userId
        );

        return [
            'status' => 'success',
            'action' => 'created',
            'local_id' => $localId,
            'server_id' => $savedEntity->getId(),
            'version' => $savedEntity->getVersion(),
            'data' => $savedEntity->toArray(),
        ];
    }

    /**
     * Update existing supplier with conflict detection
     */
    private function updateExistingSupplier(int $serverId, array $data, int $clientVersion, int $userId): array
    {
        // Use repository following Clean Architecture
        $entity = $this->supplierRepository->findById($serverId);

        if ($entity === null) {
            throw new \RuntimeException("Supplier with ID {$serverId} not found");
        }

        $serverVersion = $entity->getVersion();

        // Conflict detection: Check if server version matches client version
        if ($serverVersion !== $clientVersion) {
            // Conflict detected - server has newer version
            return [
                'status' => 'conflict',
                'action' => 'conflict_detected',
                'server_id' => $serverId,
                'local_version' => $clientVersion,
                'server_version' => $serverVersion,
                'server_data' => $entity->toArray(),
                'client_data' => $data,
                'message' => 'Version conflict: server has been modified since last sync',
            ];
        }

        // No conflict - create updated entity
        $updatedEntity = new \App\Domain\Entities\SupplierEntity(
            name: $data['name'] ?? $entity->getName(),
            code: $data['code'] ?? $entity->getCode(),
            contactPerson: $data['contact_person'] ?? $entity->getContactPerson(),
            phone: $data['phone'] ?? $entity->getPhone(),
            email: $data['email'] ?? $entity->getEmail(),
            address: $data['address'] ?? $entity->getAddress(),
            city: $data['city'] ?? $entity->getCity(),
            state: $data['state'] ?? $entity->getState(),
            country: $data['country'] ?? $entity->getCountry(),
            postalCode: $data['postal_code'] ?? $entity->getPostalCode(),
            status: $data['status'] ?? $entity->getStatus(),
            version: $serverVersion + 1,
            id: $serverId,
            createdAt: $entity->getCreatedAt(),
            updatedAt: new \DateTime()
        );

        $savedEntity = $this->supplierRepository->save($updatedEntity);

        // Audit logging through service interface (Clean Architecture)
        $this->auditService->log(
            'update',
            'Supplier',
            $savedEntity->getId(),
            $entity->toArray(),
            $savedEntity->toArray(),
            'Supplier updated via sync',
            $userId
        );

        return [
            'status' => 'success',
            'action' => 'updated',
            'server_id' => $savedEntity->getId(),
            'version' => $savedEntity->getVersion(),
            'data' => $savedEntity->toArray(),
        ];
    }

    /**
     * Resolve sync conflict using specified strategy
     *
     * @param  int  $serverId  Supplier ID
     * @param  array  $clientData  Client data
     * @param  string  $strategy  Resolution strategy (server_wins, client_wins, merge)
     * @param  int  $userId  User ID
     * @return array Resolution result
     */
    public function resolveConflict(int $serverId, array $clientData, string $strategy, int $userId): array
    {
        $entity = $this->supplierRepository->findById($serverId);

        if ($entity === null) {
            throw new \RuntimeException("Supplier with ID {$serverId} not found");
        }

        switch ($strategy) {
            case 'server_wins':
                // Keep server data, discard client changes
                return [
                    'status' => 'resolved',
                    'strategy' => 'server_wins',
                    'data' => $entity->toArray(),
                ];

            case 'client_wins':
                // Apply client changes, increment version
                $updatedEntity = new \App\Domain\Entities\SupplierEntity(
                    name: $clientData['name'] ?? $entity->getName(),
                    code: $clientData['code'] ?? $entity->getCode(),
                    contactPerson: $clientData['contact_person'] ?? $entity->getContactPerson(),
                    phone: $clientData['phone'] ?? $entity->getPhone(),
                    email: $clientData['email'] ?? $entity->getEmail(),
                    address: $clientData['address'] ?? $entity->getAddress(),
                    city: $clientData['city'] ?? $entity->getCity(),
                    state: $clientData['state'] ?? $entity->getState(),
                    country: $clientData['country'] ?? $entity->getCountry(),
                    postalCode: $clientData['postal_code'] ?? $entity->getPostalCode(),
                    status: $clientData['status'] ?? $entity->getStatus(),
                    version: $entity->getVersion() + 1,
                    id: $serverId,
                    createdAt: $entity->getCreatedAt(),
                    updatedAt: new \DateTime()
                );

                $savedEntity = $this->supplierRepository->save($updatedEntity);

                // Audit logging through service interface (Clean Architecture)
                $this->auditService->log(
                    'update',
                    'Supplier',
                    $savedEntity->getId(),
                    $entity->toArray(),
                    $savedEntity->toArray(),
                    'Conflict resolved: client wins',
                    $userId
                );

                return [
                    'status' => 'resolved',
                    'strategy' => 'client_wins',
                    'data' => $savedEntity->toArray(),
                ];

            case 'merge':
                // Intelligent merge - preserve non-conflicting changes
                $mergedData = $this->mergeData($entity->toArray(), $clientData);

                $mergedEntity = new \App\Domain\Entities\SupplierEntity(
                    name: $mergedData['name'],
                    code: $mergedData['code'],
                    contactPerson: $mergedData['contact_person'] ?? null,
                    phone: $mergedData['phone'] ?? null,
                    email: $mergedData['email'] ?? null,
                    address: $mergedData['address'] ?? null,
                    city: $mergedData['city'] ?? null,
                    state: $mergedData['state'] ?? null,
                    country: $mergedData['country'] ?? null,
                    postalCode: $mergedData['postal_code'] ?? null,
                    status: $mergedData['status'] ?? 'active',
                    version: $entity->getVersion() + 1,
                    id: $serverId,
                    createdAt: $entity->getCreatedAt(),
                    updatedAt: new \DateTime()
                );

                $savedEntity = $this->supplierRepository->save($mergedEntity);

                // Audit logging through service interface (Clean Architecture)
                $this->auditService->log(
                    'update',
                    'Supplier',
                    $savedEntity->getId(),
                    $entity->toArray(),
                    $savedEntity->toArray(),
                    'Conflict resolved: merged',
                    $userId
                );

                return [
                    'status' => 'resolved',
                    'strategy' => 'merge',
                    'data' => $savedEntity->toArray(),
                ];

            default:
                throw new \InvalidArgumentException("Invalid conflict resolution strategy: {$strategy}");
        }
    }

    /**
     * Merge server and client data intelligently
     * Keeps client changes for user-modified fields
     */
    private function mergeData(array $serverData, array $clientData): array
    {
        // Simple merge strategy: client data takes precedence for specified fields
        return array_merge($serverData, array_filter($clientData, function ($value) {
            return $value !== null;
        }));
    }

    /**
     * Get changes since last sync for a user
     *
     * @param  int  $userId  User ID
     * @param  string|null  $lastSyncedAt  ISO 8601 timestamp of last sync
     * @return array Changes since last sync
     */
    public function getChangesSinceLastSync(int $userId, ?string $lastSyncedAt): array
    {
        // For now, return all suppliers
        // In a production system, this should filter by updated_at > lastSyncedAt
        // and could use the repository with additional filtering methods
        $filters = [];
        $result = $this->supplierRepository->getAll($filters, 1, 1000);

        return [
            'suppliers' => array_map(fn ($entity) => $entity->toArray(), $result['data']),
            'sync_timestamp' => now()->toISOString(),
        ];
    }
}
