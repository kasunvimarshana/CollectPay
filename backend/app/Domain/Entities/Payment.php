<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

/**
 * Payment Entity
 * Represents a payment made to a supplier (advance, partial, or final)
 */
class Payment
{
    private string $id;
    private string $supplierId;
    private float $amount;
    private string $type; // advance, partial, final
    private DateTimeImmutable $paymentDate;
    private ?string $notes;
    private ?string $referenceNumber;
    private string $userId; // Person who made the payment
    private string $idempotencyKey; // For preventing duplicates during sync
    private int $version;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    public function __construct(
        string $id,
        string $supplierId,
        float $amount,
        string $type,
        DateTimeImmutable $paymentDate,
        string $userId,
        string $idempotencyKey,
        ?string $notes = null,
        ?string $referenceNumber = null,
        int $version = 1,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->amount = $amount;
        $this->type = $type;
        $this->paymentDate = $paymentDate;
        $this->userId = $userId;
        $this->idempotencyKey = $idempotencyKey;
        $this->notes = $notes;
        $this->referenceNumber = $referenceNumber;
        $this->version = $version;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getSupplierId(): string
    {
        return $this->supplierId;
    }

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getPaymentDate(): DateTimeImmutable
    {
        return $this->paymentDate;
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function getIdempotencyKey(): string
    {
        return $this->idempotencyKey;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getReferenceNumber(): ?string
    {
        return $this->referenceNumber;
    }

    public function getVersion(): int
    {
        return $this->version;
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

    public function incrementVersion(): void
    {
        $this->version++;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'amount' => $this->amount,
            'type' => $this->type,
            'payment_date' => $this->paymentDate->format('Y-m-d H:i:s'),
            'user_id' => $this->userId,
            'idempotency_key' => $this->idempotencyKey,
            'notes' => $this->notes,
            'reference_number' => $this->referenceNumber,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
