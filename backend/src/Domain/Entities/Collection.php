<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Entities;

use DateTimeImmutable;

/**
 * Collection Entity
 * 
 * Represents a collection record with multi-unit quantity tracking.
 * Maintains relationship with supplier, product, and applied rate.
 */
final class Collection
{
    private ?int $id;
    private int $supplierId;
    private int $productId;
    private int $productRateId;
    private int $userId;
    private float $quantity;
    private float $rate;
    private float $totalAmount;
    private DateTimeImmutable $collectionDate;
    private ?string $notes;
    private string $syncStatus;
    private ?string $deviceId;
    private int $version;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    public function __construct(
        int $supplierId,
        int $productId,
        int $productRateId,
        int $userId,
        float $quantity,
        float $rate,
        DateTimeImmutable $collectionDate,
        ?string $notes = null,
        string $syncStatus = 'synced',
        ?string $deviceId = null,
        int $version = 1,
        ?int $id = null,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->validateQuantity($quantity);
        $this->validateRate($rate);
        
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->productRateId = $productRateId;
        $this->userId = $userId;
        $this->quantity = $quantity;
        $this->rate = $rate;
        $this->totalAmount = $this->calculateTotal();
        $this->collectionDate = $collectionDate;
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

    public function getProductId(): int
    {
        return $this->productId;
    }

    public function getProductRateId(): int
    {
        return $this->productRateId;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getQuantity(): float
    {
        return $this->quantity;
    }

    public function getRate(): float
    {
        return $this->rate;
    }

    public function getTotalAmount(): float
    {
        return $this->totalAmount;
    }

    public function getCollectionDate(): DateTimeImmutable
    {
        return $this->collectionDate;
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

    public function updateQuantity(float $quantity): void
    {
        $this->validateQuantity($quantity);
        $this->quantity = $quantity;
        $this->totalAmount = $this->calculateTotal();
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

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'product_id' => $this->productId,
            'product_rate_id' => $this->productRateId,
            'user_id' => $this->userId,
            'quantity' => $this->quantity,
            'rate' => $this->rate,
            'total_amount' => $this->totalAmount,
            'collection_date' => $this->collectionDate->format('Y-m-d H:i:s'),
            'notes' => $this->notes,
            'sync_status' => $this->syncStatus,
            'device_id' => $this->deviceId,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s')
        ];
    }

    private function calculateTotal(): float
    {
        return round($this->quantity * $this->rate, 2);
    }

    private function validateQuantity(float $quantity): void
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than zero');
        }
    }

    private function validateRate(float $rate): void
    {
        if ($rate < 0) {
            throw new \InvalidArgumentException('Rate cannot be negative');
        }
    }
}
