<?php

namespace Domain\Collection;

use Domain\Shared\ValueObjects\Money;
use Domain\Shared\ValueObjects\Uuid;
use DateTimeImmutable;

/**
 * Collection Entity - Records product collection from suppliers
 */
final class Collection
{
    private Uuid $id;
    private Uuid $supplierId;
    private Uuid $collectedBy;
    private ProductType $productType;
    private Quantity $quantity;
    private Money $ratePerUnit;
    private Money $totalAmount;
    private ?string $notes;
    private CollectionStatus $status;
    private DateTimeImmutable $collectionDate;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?string $syncId; // For offline sync

    private function __construct(
        Uuid $id,
        Uuid $supplierId,
        Uuid $collectedBy,
        ProductType $productType,
        Quantity $quantity,
        Money $ratePerUnit,
        DateTimeImmutable $collectionDate,
        ?string $notes = null,
        ?string $syncId = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->collectedBy = $collectedBy;
        $this->productType = $productType;
        $this->quantity = $quantity;
        $this->ratePerUnit = $ratePerUnit;
        $this->notes = $notes;
        $this->status = CollectionStatus::pending();
        $this->collectionDate = $collectionDate;
        $this->createdAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
        $this->syncId = $syncId;
        
        $this->calculateTotal();
    }

    public static function create(
        Uuid $supplierId,
        Uuid $collectedBy,
        ProductType $productType,
        Quantity $quantity,
        Money $ratePerUnit,
        DateTimeImmutable $collectionDate,
        ?string $notes = null,
        ?string $syncId = null
    ): self {
        return new self(
            Uuid::generate(),
            $supplierId,
            $collectedBy,
            $productType,
            $quantity,
            $ratePerUnit,
            $collectionDate,
            $notes,
            $syncId
        );
    }

    public static function reconstitute(
        Uuid $id,
        Uuid $supplierId,
        Uuid $collectedBy,
        ProductType $productType,
        Quantity $quantity,
        Money $ratePerUnit,
        Money $totalAmount,
        ?string $notes,
        CollectionStatus $status,
        DateTimeImmutable $collectionDate,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        ?string $syncId
    ): self {
        $collection = new self(
            $id,
            $supplierId,
            $collectedBy,
            $productType,
            $quantity,
            $ratePerUnit,
            $collectionDate,
            $notes,
            $syncId
        );
        $collection->totalAmount = $totalAmount;
        $collection->status = $status;
        $collection->createdAt = $createdAt;
        $collection->updatedAt = $updatedAt;
        return $collection;
    }

    public function updateDetails(
        ProductType $productType,
        Quantity $quantity,
        Money $ratePerUnit,
        ?string $notes
    ): void {
        $this->productType = $productType;
        $this->quantity = $quantity;
        $this->ratePerUnit = $ratePerUnit;
        $this->notes = $notes;
        $this->calculateTotal();
        $this->updatedAt = new DateTimeImmutable();
    }

    public function approve(): void
    {
        $this->status = CollectionStatus::approved();
        $this->updatedAt = new DateTimeImmutable();
    }

    public function reject(string $reason): void
    {
        $this->status = CollectionStatus::rejected();
        $this->notes = ($this->notes ? $this->notes . ' | ' : '') . "Rejected: {$reason}";
        $this->updatedAt = new DateTimeImmutable();
    }

    private function calculateTotal(): void
    {
        $this->totalAmount = $this->ratePerUnit->multiply($this->quantity->value());
    }

    // Getters
    public function id(): Uuid
    {
        return $this->id;
    }

    public function supplierId(): Uuid
    {
        return $this->supplierId;
    }

    public function collectedBy(): Uuid
    {
        return $this->collectedBy;
    }

    public function productType(): ProductType
    {
        return $this->productType;
    }

    public function quantity(): Quantity
    {
        return $this->quantity;
    }

    public function ratePerUnit(): Money
    {
        return $this->ratePerUnit;
    }

    public function totalAmount(): Money
    {
        return $this->totalAmount;
    }

    public function notes(): ?string
    {
        return $this->notes;
    }

    public function status(): CollectionStatus
    {
        return $this->status;
    }

    public function collectionDate(): DateTimeImmutable
    {
        return $this->collectionDate;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function syncId(): ?string
    {
        return $this->syncId;
    }
}
