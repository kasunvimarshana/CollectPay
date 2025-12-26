<?php

namespace App\Application\DTOs;

/**
 * Create Collection DTO
 * 
 * Data Transfer Object for creating a new collection.
 * Decouples HTTP layer from domain layer.
 */
class CreateCollectionDTO
{
    public function __construct(
        public readonly int $supplierId,
        public readonly int $productId,
        public readonly int $userId,
        public readonly string $collectionDate,
        public readonly float $quantity,
        public readonly string $unit,
        public readonly ?string $notes = null,
        public readonly ?array $metadata = null
    ) {
    }

    /**
     * Create DTO from array
     * 
     * @param array $data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        return new self(
            supplierId: $data['supplier_id'],
            productId: $data['product_id'],
            userId: $data['user_id'],
            collectionDate: $data['collection_date'],
            quantity: (float) $data['quantity'],
            unit: $data['unit'],
            notes: $data['notes'] ?? null,
            metadata: $data['metadata'] ?? null
        );
    }
}
