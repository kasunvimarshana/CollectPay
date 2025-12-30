<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Create Rate DTO
 */
final class CreateRateDTO
{
    public function __construct(
        public readonly string $productId,
        public readonly float $ratePerUnit,
        public readonly string $currency,
        public readonly string $unit,
        public readonly string $effectiveFrom // ISO 8601 datetime string
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            $data['product_id'],
            (float) $data['rate_per_unit'],
            $data['currency'] ?? 'USD',
            $data['unit'],
            $data['effective_from']
        );
    }
}
