<?php

namespace App\Application\DTOs;

/**
 * Sync Operation DTO
 * 
 * Data Transfer Object for a single sync operation.
 */
class SyncOperationDTO
{
    public function __construct(
        public readonly string $localId,
        public readonly string $entity,
        public readonly string $operation,
        public readonly array $data,
        public readonly string $timestamp
    ) {
        $this->validate();
    }

    private function validate(): void
    {
        $allowedEntities = ['supplier', 'product', 'product_rate', 'collection', 'payment'];
        if (!in_array($this->entity, $allowedEntities)) {
            throw new \InvalidArgumentException("Invalid entity: {$this->entity}");
        }

        $allowedOperations = ['create', 'update', 'delete'];
        if (!in_array($this->operation, $allowedOperations)) {
            throw new \InvalidArgumentException("Invalid operation: {$this->operation}");
        }
    }

    public static function fromArray(array $data): self
    {
        return new self(
            localId: $data['local_id'],
            entity: $data['entity'],
            operation: $data['operation'],
            data: $data['data'],
            timestamp: $data['timestamp']
        );
    }
}
