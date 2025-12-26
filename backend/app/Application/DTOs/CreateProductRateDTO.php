<?php

namespace App\Application\DTOs;

/**
 * Create ProductRate DTO
 * 
 * Data Transfer Object for creating a new product rate.
 * Decouples HTTP layer from domain layer.
 */
class CreateProductRateDTO
{
    public function __construct(
        public readonly int $productId,
        public readonly string $unit,
        public readonly float $rate,
        public readonly string $effectiveDate,
        public readonly ?string $endDate = null,
        public readonly bool $isActive = true,
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
            productId: $data['product_id'],
            unit: $data['unit'],
            rate: (float) $data['rate'],
            effectiveDate: $data['effective_date'],
            endDate: $data['end_date'] ?? null,
            isActive: $data['is_active'] ?? true,
            metadata: $data['metadata'] ?? null
        );
    }
}
