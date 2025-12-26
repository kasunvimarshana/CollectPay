<?php

namespace App\Application\DTOs;

/**
 * Update Payment DTO
 * 
 * Data Transfer Object for updating an existing payment.
 * Decouples HTTP layer from domain layer.
 */
class UpdatePaymentDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $version,
        public readonly ?int $supplierId = null,
        public readonly ?string $paymentDate = null,
        public readonly ?float $amount = null,
        public readonly ?string $paymentType = null,
        public readonly ?string $paymentMethod = null,
        public readonly ?string $referenceNumber = null,
        public readonly ?string $notes = null,
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
            supplierId: $data['supplier_id'] ?? null,
            paymentDate: $data['payment_date'] ?? null,
            amount: isset($data['amount']) ? (float) $data['amount'] : null,
            paymentType: $data['payment_type'] ?? null,
            paymentMethod: $data['payment_method'] ?? null,
            referenceNumber: $data['reference_number'] ?? null,
            notes: $data['notes'] ?? null,
            metadata: $data['metadata'] ?? null
        );
    }
}
