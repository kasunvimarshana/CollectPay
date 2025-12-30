<?php

declare(strict_types=1);

namespace Application\DTOs;

final class CreateProductRateDTO
{
    public function __construct(
        public readonly string $productId,
        public readonly float $rateAmount,
        public readonly string $currency,
        public readonly string $effectiveFrom
    ) {}
}
