<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\Quantity;
use Domain\ValueObjects\Money;
use DateTimeImmutable;

/**
 * Collection Entity
 * Represents a collection transaction from a supplier
 */
final class Collection
{
    private string $id;
    private string $supplierId;
    private string $productId;
    private string $rateId;
    private Quantity $quantity;
    private Money $totalAmount;
    private DateTimeImmutable $collectionDate;
    private ?string $notes;
    private string $collectedBy;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    private function __construct(
        string $id,
        string $supplierId,
        string $productId,
        string $rateId,
        Quantity $quantity,
        Money $totalAmount,
        DateTimeImmutable $collectionDate,
        string $collectedBy,
        ?string $notes = null,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->rateId = $rateId;
        $this->quantity = $quantity;
        $this->totalAmount = $totalAmount;
        $this->collectionDate = $collectionDate;
        $this->collectedBy = $collectedBy;
        $this->notes = $notes;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
    }

    public static function create(
        string $id,
        string $supplierId,
        string $productId,
        string $rateId,
        Quantity $quantity,
        Money $totalAmount,
        DateTimeImmutable $collectionDate,
        string $collectedBy,
        ?string $notes = null
    ): self {
        return new self(
            $id,
            $supplierId,
            $productId,
            $rateId,
            $quantity,
            $totalAmount,
            $collectionDate,
            $collectedBy,
            $notes
        );
    }

    public static function reconstitute(
        string $id,
        string $supplierId,
        string $productId,
        string $rateId,
        Quantity $quantity,
        Money $totalAmount,
        DateTimeImmutable $collectionDate,
        string $collectedBy,
        ?string $notes,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        ?DateTimeImmutable $deletedAt = null
    ): self {
        return new self(
            $id,
            $supplierId,
            $productId,
            $rateId,
            $quantity,
            $totalAmount,
            $collectionDate,
            $collectedBy,
            $notes,
            $createdAt,
            $updatedAt,
            $deletedAt
        );
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

    public function getProductId(): string
    {
        return $this->productId;
    }

    public function getRateId(): string
    {
        return $this->rateId;
    }

    public function getQuantity(): Quantity
    {
        return $this->quantity;
    }

    public function getTotalAmount(): Money
    {
        return $this->totalAmount;
    }

    public function getCollectionDate(): DateTimeImmutable
    {
        return $this->collectionDate;
    }

    public function getCollectedBy(): string
    {
        return $this->collectedBy;
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

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'product_id' => $this->productId,
            'rate_id' => $this->rateId,
            'quantity' => $this->quantity->toArray(),
            'total_amount' => $this->totalAmount->toArray(),
            'collection_date' => $this->collectionDate->format('Y-m-d H:i:s'),
            'collected_by' => $this->collectedBy,
            'notes' => $this->notes,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
