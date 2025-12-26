<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

/**
 * Collection Entity
 * Represents a collection record of a product from a supplier
 * The rate at the time of collection is preserved for accurate payment calculations
 */
class Collection
{
    private string $id;
    private string $supplierId;
    private string $productId;
    private float $quantity;
    private string $rateVersionId; // Rate version that was active at collection time
    private float $appliedRate; // Denormalized for historical accuracy
    private DateTimeImmutable $collectionDate;
    private ?string $notes;
    private string $userId; // Collector
    private string $idempotencyKey; // For preventing duplicates during sync
    private int $version;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    public function __construct(
        string $id,
        string $supplierId,
        string $productId,
        float $quantity,
        string $rateVersionId,
        float $appliedRate,
        DateTimeImmutable $collectionDate,
        string $userId,
        string $idempotencyKey,
        ?string $notes = null,
        int $version = 1,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->quantity = $quantity;
        $this->rateVersionId = $rateVersionId;
        $this->appliedRate = $appliedRate;
        $this->collectionDate = $collectionDate;
        $this->userId = $userId;
        $this->idempotencyKey = $idempotencyKey;
        $this->notes = $notes;
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

    public function getProductId(): string
    {
        return $this->productId;
    }

    public function getQuantity(): float
    {
        return $this->quantity;
    }

    public function getRateVersionId(): string
    {
        return $this->rateVersionId;
    }

    public function getAppliedRate(): float
    {
        return $this->appliedRate;
    }

    public function getCollectionDate(): DateTimeImmutable
    {
        return $this->collectionDate;
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

    public function calculateValue(): float
    {
        return $this->quantity * $this->appliedRate;
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
            'product_id' => $this->productId,
            'quantity' => $this->quantity,
            'rate_version_id' => $this->rateVersionId,
            'applied_rate' => $this->appliedRate,
            'collection_date' => $this->collectionDate->format('Y-m-d H:i:s'),
            'user_id' => $this->userId,
            'idempotency_key' => $this->idempotencyKey,
            'notes' => $this->notes,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
