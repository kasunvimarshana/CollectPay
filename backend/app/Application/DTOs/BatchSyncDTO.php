<?php

namespace App\Application\DTOs;

/**
 * Batch Sync DTO
 * 
 * Data Transfer Object for batch sync operations.
 */
class BatchSyncDTO
{
    /**
     * @param string $deviceId
     * @param SyncOperationDTO[] $operations
     */
    public function __construct(
        public readonly string $deviceId,
        public readonly array $operations
    ) {
        if (empty($this->deviceId)) {
            throw new \InvalidArgumentException('Device ID is required');
        }

        if (empty($this->operations)) {
            throw new \InvalidArgumentException('At least one operation is required');
        }

        foreach ($this->operations as $operation) {
            if (!$operation instanceof SyncOperationDTO) {
                throw new \InvalidArgumentException('All operations must be SyncOperationDTO instances');
            }
        }
    }

    public static function fromArray(array $data): self
    {
        $operations = array_map(
            fn($op) => SyncOperationDTO::fromArray($op),
            $data['operations']
        );

        return new self(
            deviceId: $data['device_id'],
            operations: $operations
        );
    }
}
