<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\Money;
use DateTimeImmutable;

/**
 * Payment Entity
 * Represents a payment to a supplier (advance, partial, or final)
 */
final class Payment
{
    public const TYPE_ADVANCE = 'advance';
    public const TYPE_PARTIAL = 'partial';
    public const TYPE_FINAL = 'final';

    private string $id;
    private string $supplierId;
    private string $type;
    private Money $amount;
    private DateTimeImmutable $paymentDate;
    private string $paidBy;
    private ?string $referenceNumber;
    private ?string $notes;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    private function __construct(
        string $id,
        string $supplierId,
        string $type,
        Money $amount,
        DateTimeImmutable $paymentDate,
        string $paidBy,
        ?string $referenceNumber = null,
        ?string $notes = null,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->validateType($type);
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->type = $type;
        $this->amount = $amount;
        $this->paymentDate = $paymentDate;
        $this->paidBy = $paidBy;
        $this->referenceNumber = $referenceNumber;
        $this->notes = $notes;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
    }

    public static function create(
        string $id,
        string $supplierId,
        string $type,
        Money $amount,
        DateTimeImmutable $paymentDate,
        string $paidBy,
        ?string $referenceNumber = null,
        ?string $notes = null
    ): self {
        return new self(
            $id,
            $supplierId,
            $type,
            $amount,
            $paymentDate,
            $paidBy,
            $referenceNumber,
            $notes
        );
    }

    public static function reconstitute(
        string $id,
        string $supplierId,
        string $type,
        Money $amount,
        DateTimeImmutable $paymentDate,
        string $paidBy,
        ?string $referenceNumber,
        ?string $notes,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        ?DateTimeImmutable $deletedAt = null
    ): self {
        return new self(
            $id,
            $supplierId,
            $type,
            $amount,
            $paymentDate,
            $paidBy,
            $referenceNumber,
            $notes,
            $createdAt,
            $updatedAt,
            $deletedAt
        );
    }

    private function validateType(string $type): void
    {
        $validTypes = [self::TYPE_ADVANCE, self::TYPE_PARTIAL, self::TYPE_FINAL];
        if (!in_array($type, $validTypes, true)) {
            throw new \InvalidArgumentException("Invalid payment type: {$type}");
        }
    }

    // Getters
    public function getId(): string
    {
        return $this->id;
    }

    public function getSupplierId(): string
    {
        return $this->supplierId;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getAmount(): Money
    {
        return $this->amount;
    }

    public function getPaymentDate(): DateTimeImmutable
    {
        return $this->paymentDate;
    }

    public function getPaidBy(): string
    {
        return $this->paidBy;
    }

    public function getReferenceNumber(): ?string
    {
        return $this->referenceNumber;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    // Business logic
    public function updateNotes(string $notes): void
    {
        $this->notes = $notes;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function delete(): void
    {
        $this->deletedAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }

    public function isAdvance(): bool
    {
        return $this->type === self::TYPE_ADVANCE;
    }

    public function isPartial(): bool
    {
        return $this->type === self::TYPE_PARTIAL;
    }

    public function isFinal(): bool
    {
        return $this->type === self::TYPE_FINAL;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'type' => $this->type,
            'amount' => $this->amount->toArray(),
            'payment_date' => $this->paymentDate->format('Y-m-d H:i:s'),
            'paid_by' => $this->paidBy,
            'reference_number' => $this->referenceNumber,
            'notes' => $this->notes,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
