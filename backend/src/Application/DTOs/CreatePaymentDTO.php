<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Create Payment DTO
 */
final class CreatePaymentDTO
{
    public function __construct(
        public readonly string $supplierId,
        public readonly string $type,
        public readonly float $amount,
        public readonly string $currency,
        public readonly string $paymentDate,
        public readonly string $paidBy,
        public readonly ?string $referenceNumber = null,
        public readonly ?string $notes = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            $data['supplier_id'],
            $data['type'],
            (float) $data['amount'],
            $data['currency'] ?? 'USD',
            $data['payment_date'],
            $data['paid_by'],
            $data['reference_number'] ?? null,
            $data['notes'] ?? null
        );
    }
}
