<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Entities;

use DateTimeImmutable;

/**
 * Payment Entity
 * 
 * Represents a payment record (advance, partial, or full).
 * Supports auditable financial tracking and calculations.
 */
final class Payment
{
    private ?int $id;
    private int $supplierId;
    private int $userId;
    private float $amount;
    private string $paymentType;
    private DateTimeImmutable $paymentDate;
    private ?string $referenceNumber;
    private ?string $notes;
    private string $syncStatus;
    private ?string $deviceId;
    private int $version;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    public function __construct(
        int $supplierId,
        int $userId,
        float $amount,
        string $paymentType,
        DateTimeImmutable $paymentDate,
        ?string $referenceNumber = null,
        ?string $notes = null,
        string $syncStatus = 'synced',
        ?string $deviceId = null,
        int $version = 1,
        ?int $id = null,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->validateAmount($amount);
        $this->validatePaymentType($paymentType);
        
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->userId = $userId;
        $this->amount = $amount;
        $this->paymentType = $paymentType;
        $this->paymentDate = $paymentDate;
        $this->referenceNumber = $referenceNumber;
        $this->notes = $notes;
        $this->syncStatus = $syncStatus;
        $this->deviceId = $deviceId;
        $this->version = $version;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSupplierId(): int
    {
        return $this->supplierId;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function getPaymentType(): string
    {
        return $this->paymentType;
    }

    public function getPaymentDate(): DateTimeImmutable
    {
        return $this->paymentDate;
    }

    public function getReferenceNumber(): ?string
    {
        return $this->referenceNumber;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getSyncStatus(): string
    {
        return $this->syncStatus;
    }

    public function getDeviceId(): ?string
    {
        return $this->deviceId;
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

    public function updateAmount(float $amount): void
    {
        $this->validateAmount($amount);
        $this->amount = $amount;
        $this->version++;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateNotes(?string $notes): void
    {
        $this->notes = $notes;
        $this->version++;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function markAsSynced(): void
    {
        $this->syncStatus = 'synced';
        $this->updatedAt = new DateTimeImmutable();
    }

    public function markAsPending(): void
    {
        $this->syncStatus = 'pending';
        $this->updatedAt = new DateTimeImmutable();
    }

    public function delete(): void
    {
        $this->deletedAt = new DateTimeImmutable();
        $this->version++;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function isAdvance(): bool
    {
        return $this->paymentType === 'advance';
    }

    public function isPartial(): bool
    {
        return $this->paymentType === 'partial';
    }

    public function isFull(): bool
    {
        return $this->paymentType === 'full';
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'user_id' => $this->userId,
            'amount' => $this->amount,
            'payment_type' => $this->paymentType,
            'payment_date' => $this->paymentDate->format('Y-m-d H:i:s'),
            'reference_number' => $this->referenceNumber,
            'notes' => $this->notes,
            'sync_status' => $this->syncStatus,
            'device_id' => $this->deviceId,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s')
        ];
    }

    private function validateAmount(float $amount): void
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Payment amount must be greater than zero');
        }
    }

    private function validatePaymentType(string $paymentType): void
    {
        $validTypes = ['advance', 'partial', 'full'];
        
        if (!in_array($paymentType, $validTypes, true)) {
            throw new \InvalidArgumentException(
                sprintf('Invalid payment type. Must be one of: %s', implode(', ', $validTypes))
            );
        }
    }
}
