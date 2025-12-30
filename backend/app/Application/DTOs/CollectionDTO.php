<?php

namespace App\Application\DTOs;

/**
 * Collection Data Transfer Object
 */
class CollectionDTO
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $supplierId,
        public readonly int $productId,
        public readonly float $quantity,
        public readonly string $unit,
        public readonly string $collectionDate,
        public readonly ?string $notes,
        public readonly ?int $createdBy,
        public readonly ?string $createdAt = null,
        public readonly ?string $updatedAt = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            supplierId: $data['supplier_id'],
            productId: $data['product_id'],
            quantity: (float) $data['quantity'],
            unit: $data['unit'],
            collectionDate: $data['collection_date'],
            notes: $data['notes'] ?? null,
            createdBy: $data['created_by'] ?? null,
            createdAt: $data['created_at'] ?? null,
            updatedAt: $data['updated_at'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'product_id' => $this->productId,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'collection_date' => $this->collectionDate,
            'notes' => $this->notes,
            'created_by' => $this->createdBy,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
