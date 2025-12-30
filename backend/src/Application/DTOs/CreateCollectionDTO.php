<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Data Transfer Object for Collection Creation
 */
final class CreateCollectionDTO
{
    public function __construct(
        public readonly string $supplierId,
        public readonly string $productId,
        public readonly string $userId,
        public readonly float $quantity,
        public readonly string $unit,
        public readonly ?string $collectionDate = null,
        public readonly array $metadata = []
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            supplierId: $data['supplier_id'] ?? '',
            productId: $data['product_id'] ?? '',
            userId: $data['user_id'] ?? '',
            quantity: (float)($data['quantity'] ?? 0),
            unit: $data['unit'] ?? '',
            collectionDate: $data['collection_date'] ?? null,
            metadata: $data['metadata'] ?? []
        );
    }

    public function toArray(): array
    {
        return [
            'supplier_id' => $this->supplierId,
            'product_id' => $this->productId,
            'user_id' => $this->userId,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'collection_date' => $this->collectionDate,
            'metadata' => $this->metadata,
        ];
    }
}
