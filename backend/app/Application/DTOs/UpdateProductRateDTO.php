<?php

namespace App\Application\DTOs;

/**
 * Update ProductRate DTO
 * 
 * Data Transfer Object for updating an existing product rate.
 * Decouples HTTP layer from domain layer.
 */
class UpdateProductRateDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $version,
        public readonly ?int $productId = null,
        public readonly ?string $unit = null,
        public readonly ?float $rate = null,
        public readonly ?string $effectiveDate = null,
        public readonly ?string $endDate = null,
        public readonly ?bool $isActive = null,
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
            productId: $data['product_id'] ?? null,
            unit: $data['unit'] ?? null,
            rate: isset($data['rate']) ? (float) $data['rate'] : null,
            effectiveDate: $data['effective_date'] ?? null,
            endDate: $data['end_date'] ?? null,
            isActive: $data['is_active'] ?? null,
            metadata: $data['metadata'] ?? null
        );
    }
}
