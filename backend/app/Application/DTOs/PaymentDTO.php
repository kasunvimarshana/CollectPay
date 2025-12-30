<?php

namespace App\Application\DTOs;

/**
 * Payment Data Transfer Object
 */
class PaymentDTO
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $supplierId,
        public readonly float $amount,
        public readonly string $currency,
        public readonly string $paymentType,
        public readonly string $paymentDate,
        public readonly ?string $reference,
        public readonly ?string $notes,
        public readonly ?int $createdBy,
        public readonly ?string $createdAt = null,
        public readonly ?string $updatedAt = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            supplierId: $data['supplier_id'],
            amount: (float) $data['amount'],
            currency: $data['currency'] ?? 'LKR',
            paymentType: $data['payment_type'],
            paymentDate: $data['payment_date'],
            reference: $data['reference'] ?? null,
            notes: $data['notes'] ?? null,
            createdBy: $data['created_by'] ?? null,
            createdAt: $data['created_at'] ?? null,
            updatedAt: $data['updated_at'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'payment_type' => $this->paymentType,
            'payment_date' => $this->paymentDate,
            'reference' => $this->reference,
            'notes' => $this->notes,
            'created_by' => $this->createdBy,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
