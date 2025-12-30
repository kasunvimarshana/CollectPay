<?php

namespace App\Application\DTOs;

/**
 * Collection Data Transfer Object
 *
 * Used to transfer collection data between layers.
 * Implements immutability and validation at the application layer.
 */
class CollectionDTO
{
    public readonly int $supplierId;

    public readonly int $productId;

    public readonly int $collectedBy;

    public readonly float $quantity;

    public readonly string $unit;

    public readonly float $rate;

    public readonly ?int $rateId;

    public readonly string $collectionDate;

    public readonly ?string $collectionTime;

    public readonly ?string $notes;

    public readonly array $metadata;

    public readonly ?int $id;

    public readonly int $version;

    public function __construct(
        int $supplierId,
        int $productId,
        int $collectedBy,
        float $quantity,
        string $unit,
        float $rate,
        string $collectionDate,
        ?int $rateId = null,
        ?string $collectionTime = null,
        ?string $notes = null,
        array $metadata = [],
        ?int $id = null,
        int $version = 1
    ) {
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->collectedBy = $collectedBy;
        $this->quantity = $quantity;
        $this->unit = $unit;
        $this->rate = $rate;
        $this->rateId = $rateId;
        $this->collectionDate = $collectionDate;
        $this->collectionTime = $collectionTime;
        $this->notes = $notes;
        $this->metadata = $metadata;
        $this->id = $id;
        $this->version = $version;
    }

    /**
     * Create DTO from array (e.g., from HTTP request)
     */
    public static function fromArray(array $data): self
    {
        return new self(
            supplierId: $data['supplier_id'],
            productId: $data['product_id'],
            collectedBy: $data['collected_by'],
            quantity: (float) $data['quantity'],
            unit: $data['unit'],
            rate: (float) ($data['rate'] ?? $data['rate_per_unit'] ?? 0),
            collectionDate: $data['collection_date'],
            rateId: $data['rate_id'] ?? null,
            collectionTime: $data['collection_time'] ?? null,
            notes: $data['notes'] ?? null,
            metadata: $data['metadata'] ?? [],
            id: $data['id'] ?? null,
            version: $data['version'] ?? 1
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'product_id' => $this->productId,
            'collected_by' => $this->collectedBy,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'rate' => $this->rate,
            'rate_id' => $this->rateId,
            'collection_date' => $this->collectionDate,
            'collection_time' => $this->collectionTime,
            'notes' => $this->notes,
            'metadata' => $this->metadata,
            'version' => $this->version,
        ];
    }
}
