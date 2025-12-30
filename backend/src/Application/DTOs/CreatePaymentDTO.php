<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Data Transfer Object for Payment Creation
 */
final class CreatePaymentDTO
{
    public function __construct(
        public readonly string $supplierId,
        public readonly string $userId,
        public readonly float $amount,
        public readonly string $currency,
        public readonly string $paymentType,
        public readonly ?string $paymentDate = null,
        public readonly ?string $reference = null,
        public readonly array $metadata = []
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            supplierId: $data['supplier_id'] ?? '',
            userId: $data['user_id'] ?? '',
            amount: (float)($data['amount'] ?? 0),
            currency: $data['currency'] ?? 'USD',
            paymentType: $data['payment_type'] ?? 'full',
            paymentDate: $data['payment_date'] ?? null,
            reference: $data['reference'] ?? null,
            metadata: $data['metadata'] ?? []
        );
    }

    public function toArray(): array
    {
        return [
            'supplier_id' => $this->supplierId,
            'user_id' => $this->userId,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'payment_type' => $this->paymentType,
            'payment_date' => $this->paymentDate,
            'reference' => $this->reference,
            'metadata' => $this->metadata,
        ];
    }
}
