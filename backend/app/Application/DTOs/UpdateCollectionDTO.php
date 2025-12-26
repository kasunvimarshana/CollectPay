<?php

namespace App\Application\DTOs;

/**
 * Update Collection DTO
 * 
 * Data Transfer Object for updating an existing collection.
 * Decouples HTTP layer from domain layer.
 */
class UpdateCollectionDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $version,
        public readonly ?int $supplierId = null,
        public readonly ?int $productId = null,
        public readonly ?string $collectionDate = null,
        public readonly ?float $quantity = null,
        public readonly ?string $unit = null,
        public readonly ?string $notes = null,
        public readonly ?array $metadata = null
    ) {
    }

    /**
     * Create DTO from array
     * 
     * @param int $id
     * @param array $data
     * @return self
     */
    public static function fromArray(int $id, array $data): self
    {
        return new self(
            id: $id,
            version: $data['version'],
            supplierId: $data['supplier_id'] ?? null,
            productId: $data['product_id'] ?? null,
            collectionDate: $data['collection_date'] ?? null,
            quantity: isset($data['quantity']) ? (float) $data['quantity'] : null,
            unit: $data['unit'] ?? null,
            notes: $data['notes'] ?? null,
            metadata: $data['metadata'] ?? null
        );
    }
}
