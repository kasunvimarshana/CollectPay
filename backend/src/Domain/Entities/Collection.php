<?php

declare(strict_types=1);

namespace TrackVault\Domain\Entities;

use TrackVault\Domain\ValueObjects\CollectionId;
use TrackVault\Domain\ValueObjects\SupplierId;
use TrackVault\Domain\ValueObjects\ProductId;
use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Quantity;
use TrackVault\Domain\ValueObjects\Money;
use DateTimeImmutable;

/**
 * Collection Entity
 * 
 * Represents a collection transaction with multi-unit quantity tracking
 */
final class Collection
{
    private CollectionId $id;
    private SupplierId $supplierId;
    private ProductId $productId;
    private UserId $collectorId;
    private Quantity $quantity;
    private Money $rate;
    private Money $totalAmount;
    private DateTimeImmutable $collectionDate;
    private array $metadata;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;
    private int $version;

    public function __construct(
        CollectionId $id,
        SupplierId $supplierId,
        ProductId $productId,
        UserId $collectorId,
        Quantity $quantity,
        Money $rate,
        DateTimeImmutable $collectionDate,
        array $metadata = [],
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null,
        int $version = 1
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->collectorId = $collectorId;
        $this->quantity = $quantity;
        $this->rate = $rate;
        $this->totalAmount = $this->calculateTotalAmount($quantity, $rate);
        $this->collectionDate = $collectionDate;
        $this->metadata = $metadata;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
        $this->version = $version;
    }

    private function calculateTotalAmount(Quantity $quantity, Money $rate): Money
    {
        $amount = $quantity->getValue() * $rate->getAmount();
        return new Money($amount, $rate->getCurrency());
    }

    public function getId(): CollectionId
    {
        return $this->id;
    }

    public function getSupplierId(): SupplierId
    {
        return $this->supplierId;
    }

    public function getProductId(): ProductId
    {
        return $this->productId;
    }

    public function getCollectorId(): UserId
    {
        return $this->collectorId;
    }

    public function getQuantity(): Quantity
    {
        return $this->quantity;
    }

    public function getRate(): Money
    {
        return $this->rate;
    }

    public function getTotalAmount(): Money
    {
        return $this->totalAmount;
    }

    public function getCollectionDate(): DateTimeImmutable
    {
        return $this->collectionDate;
    }

    public function getMetadata(): array
    {
        return $this->metadata;
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

    public function getVersion(): int
    {
        return $this->version;
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }

    public function update(
        Quantity $quantity,
        Money $rate,
        DateTimeImmutable $collectionDate,
        array $metadata
    ): self {
        return new self(
            $this->id,
            $this->supplierId,
            $this->productId,
            $this->collectorId,
            $quantity,
            $rate,
            $collectionDate,
            $metadata,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->deletedAt,
            $this->version + 1
        );
    }

    public function delete(): self
    {
        return new self(
            $this->id,
            $this->supplierId,
            $this->productId,
            $this->collectorId,
            $this->quantity,
            $this->rate,
            $this->collectionDate,
            $this->metadata,
            $this->createdAt,
            new DateTimeImmutable(),
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->toString(),
            'supplier_id' => $this->supplierId->toString(),
            'product_id' => $this->productId->toString(),
            'collector_id' => $this->collectorId->toString(),
            'quantity' => $this->quantity->getValue(),
            'unit' => $this->quantity->getUnit(),
            'rate' => $this->rate->getAmount(),
            'currency' => $this->rate->getCurrency(),
            'total_amount' => $this->totalAmount->getAmount(),
            'collection_date' => $this->collectionDate->format('Y-m-d H:i:s'),
            'metadata' => $this->metadata,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
            'version' => $this->version,
        ];
    }
}
