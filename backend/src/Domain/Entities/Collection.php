<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\UUID;
use Domain\ValueObjects\Quantity;
use Domain\ValueObjects\Money;
use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Collection Domain Entity
 * 
 * Represents a collection of products from a supplier
 * Immutable after creation to maintain audit trail
 */
final class Collection
{
    private UUID $id;
    private UUID $supplierId;
    private UUID $productId;
    private Quantity $quantity;
    private Money $appliedRate;
    private Money $totalAmount;
    private DateTimeImmutable $collectionDate;
    private ?string $notes;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private int $version;

    private function __construct(
        UUID $id,
        UUID $supplierId,
        UUID $productId,
        Quantity $quantity,
        Money $appliedRate,
        DateTimeImmutable $collectionDate,
        ?string $notes,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        int $version
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->quantity = $quantity;
        $this->appliedRate = $appliedRate;
        $this->totalAmount = $appliedRate->multiply($quantity->amount());
        $this->collectionDate = $collectionDate;
        $this->notes = $notes ? trim($notes) : null;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->version = $version;
    }

    public static function create(
        UUID $supplierId,
        UUID $productId,
        Quantity $quantity,
        Money $appliedRate,
        DateTimeImmutable $collectionDate,
        ?string $notes = null
    ): self {
        return new self(
            UUID::generate(),
            $supplierId,
            $productId,
            $quantity,
            $appliedRate,
            $collectionDate,
            $notes,
            new DateTimeImmutable(),
            new DateTimeImmutable(),
            1
        );
    }

    public static function reconstitute(
        string $id,
        string $supplierId,
        string $productId,
        float $quantityAmount,
        string $quantityUnit,
        float $rateAmount,
        string $currency,
        DateTimeImmutable $collectionDate,
        ?string $notes,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        int $version
    ): self {
        return new self(
            UUID::fromString($id),
            UUID::fromString($supplierId),
            UUID::fromString($productId),
            new Quantity($quantityAmount, $quantityUnit),
            new Money($rateAmount, $currency),
            $collectionDate,
            $notes,
            $createdAt,
            $updatedAt,
            $version
        );
    }

    public function updateNotes(string $notes): self
    {
        return new self(
            $this->id,
            $this->supplierId,
            $this->productId,
            $this->quantity,
            $this->appliedRate,
            $this->collectionDate,
            $notes,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    // Getters
    public function id(): UUID
    {
        return $this->id;
    }

    public function supplierId(): UUID
    {
        return $this->supplierId;
    }

    public function productId(): UUID
    {
        return $this->productId;
    }

    public function quantity(): Quantity
    {
        return $this->quantity;
    }

    public function appliedRate(): Money
    {
        return $this->appliedRate;
    }

    public function totalAmount(): Money
    {
        return $this->totalAmount;
    }

    public function collectionDate(): DateTimeImmutable
    {
        return $this->collectionDate;
    }

    public function notes(): ?string
    {
        return $this->notes;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function version(): int
    {
        return $this->version;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'supplier_id' => $this->supplierId->value(),
            'product_id' => $this->productId->value(),
            'quantity_amount' => $this->quantity->amount(),
            'quantity_unit' => $this->quantity->unit(),
            'applied_rate_amount' => $this->appliedRate->amount(),
            'currency' => $this->appliedRate->currency(),
            'total_amount' => $this->totalAmount->amount(),
            'collection_date' => $this->collectionDate->format('Y-m-d H:i:s'),
            'notes' => $this->notes,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'version' => $this->version,
        ];
    }
}
