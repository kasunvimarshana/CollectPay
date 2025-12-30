<?php

declare(strict_types=1);

namespace Application\DTOs;

final class CreatePaymentDTO
{
    public function __construct(
        public readonly string $supplierId,
        public readonly float $amount,
        public readonly string $currency,
        public readonly string $type,
        public readonly string $paymentDate,
        public readonly ?string $reference = null,
        public readonly ?string $notes = null
    ) {}
}
