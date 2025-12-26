<?php

namespace App\Application\DTOs;

/**
 * Create Payment DTO
 * 
 * Data Transfer Object for creating a new payment.
 * Decouples HTTP layer from domain layer.
 */
class CreatePaymentDTO
{
    public function __construct(
        public readonly int $supplierId,
        public readonly int $userId,
        public readonly string $paymentDate,
        public readonly float $amount,
        public readonly string $paymentType,
        public readonly ?string $paymentMethod = null,
        public readonly ?string $referenceNumber = null,
        public readonly ?string $notes = null,
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
            supplierId: $data['supplier_id'],
            userId: $data['user_id'],
            paymentDate: $data['payment_date'],
            amount: (float) $data['amount'],
            paymentType: $data['payment_type'],
            paymentMethod: $data['payment_method'] ?? null,
            referenceNumber: $data['reference_number'] ?? null,
            notes: $data['notes'] ?? null,
            metadata: $data['metadata'] ?? null
        );
    }
}
