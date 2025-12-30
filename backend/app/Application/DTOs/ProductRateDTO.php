<?php

namespace App\Application\DTOs;

/**
 * ProductRate Data Transfer Object
 *
 * Used to transfer product rate data between layers.
 * Implements immutability and validation at the application layer.
 */
class ProductRateDTO
{
    public readonly int $productId;

    public readonly float $rate;

    public readonly string $unit;

    public readonly string $effectiveFrom;

    public readonly ?string $effectiveTo;

    public readonly bool $isActive;

    public readonly ?string $notes;

    public readonly ?int $id;

    public readonly int $version;

    public function __construct(
        int $productId,
        float $rate,
        string $unit,
        string $effectiveFrom,
        ?string $effectiveTo = null,
        bool $isActive = true,
        ?string $notes = null,
        ?int $id = null,
        int $version = 1
    ) {
        $this->productId = $productId;
        $this->rate = $rate;
        $this->unit = $unit;
        $this->effectiveFrom = $effectiveFrom;
        $this->effectiveTo = $effectiveTo;
        $this->isActive = $isActive;
        $this->notes = $notes;
        $this->id = $id;
        $this->version = $version;
    }

    /**
     * Create DTO from array (e.g., from HTTP request)
     */
    public static function fromArray(array $data): self
    {
        return new self(
            productId: $data['product_id'],
            rate: (float) $data['rate'],
            unit: $data['unit'],
            effectiveFrom: $data['effective_from'],
            effectiveTo: $data['effective_to'] ?? null,
            isActive: $data['is_active'] ?? true,
            notes: $data['notes'] ?? null,
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
            'product_id' => $this->productId,
            'rate' => $this->rate,
            'unit' => $this->unit,
            'effective_from' => $this->effectiveFrom,
            'effective_to' => $this->effectiveTo,
            'is_active' => $this->isActive,
            'notes' => $this->notes,
            'version' => $this->version,
        ];
    }
}
