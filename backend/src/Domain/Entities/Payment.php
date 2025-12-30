<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\Money;
use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Payment Entity
 * 
 * Represents a payment transaction to a supplier.
 */
class Payment
{
    public const TYPE_ADVANCE = 'advance';
    public const TYPE_PARTIAL = 'partial';
    public const TYPE_FULL = 'full';

    private function __construct(
        private string $id,
        private string $supplierId,
        private string $userId,
        private Money $amount,
        private string $type,
        private DateTimeImmutable $paymentDate,
        private ?string $reference,
        private ?string $notes,
        private array $metadata,
        private DateTimeImmutable $createdAt,
        private DateTimeImmutable $updatedAt
    ) {
        $this->validateType();
    }

    public static function create(
        string $id,
        string $supplierId,
        string $userId,
        Money $amount,
        string $type,
        DateTimeImmutable $paymentDate,
        ?string $reference = null,
        ?string $notes = null,
        array $metadata = []
    ): self {
        $now = new DateTimeImmutable();
        
        return new self(
            id: $id,
            supplierId: $supplierId,
            userId: $userId,
            amount: $amount,
            type: $type,
            paymentDate: $paymentDate,
            reference: $reference,
            notes: $notes,
            metadata: $metadata,
            createdAt: $now,
            updatedAt: $now
        );
    }

    public function id(): string
    {
        return $this->id;
    }

    public function supplierId(): string
    {
        return $this->supplierId;
    }

    public function userId(): string
    {
        return $this->userId;
    }

    public function amount(): Money
    {
        return $this->amount;
    }

    public function type(): string
    {
        return $this->type;
    }

    public function paymentDate(): DateTimeImmutable
    {
        return $this->paymentDate;
    }

    public function reference(): ?string
    {
        return $this->reference;
    }

    public function notes(): ?string
    {
        return $this->notes;
    }

    public function metadata(): array
    {
        return $this->metadata;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function updateNotes(string $notes): void
    {
        $this->notes = $notes;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateReference(string $reference): void
    {
        $this->reference = $reference;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateMetadata(array $metadata): void
    {
        $this->metadata = $metadata;
        $this->updatedAt = new DateTimeImmutable();
    }

    private function validateType(): void
    {
        $validTypes = [self::TYPE_ADVANCE, self::TYPE_PARTIAL, self::TYPE_FULL];
        
        if (!in_array($this->type, $validTypes)) {
            throw new InvalidArgumentException(
                "Invalid payment type: {$this->type}. Must be one of: " . implode(', ', $validTypes)
            );
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'user_id' => $this->userId,
            'amount' => $this->amount->toArray(),
            'type' => $this->type,
            'payment_date' => $this->paymentDate->format('Y-m-d H:i:s'),
            'reference' => $this->reference,
            'notes' => $this->notes,
            'metadata' => $this->metadata,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
