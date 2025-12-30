<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\Quantity;
use Domain\ValueObjects\Rate;
use Domain\ValueObjects\Money;
use DateTimeImmutable;

/**
 * Collection Entity
 * 
 * Represents a collection transaction with a supplier for a specific product.
 */
class Collection
{
    private function __construct(
        private string $id,
        private string $supplierId,
        private string $productId,
        private string $userId,
        private Quantity $quantity,
        private Rate $appliedRate,
        private Money $totalAmount,
        private DateTimeImmutable $collectionDate,
        private ?string $notes,
        private array $metadata,
        private DateTimeImmutable $createdAt,
        private DateTimeImmutable $updatedAt
    ) {
    }

    public static function create(
        string $id,
        string $supplierId,
        string $productId,
        string $userId,
        Quantity $quantity,
        Rate $appliedRate,
        DateTimeImmutable $collectionDate,
        ?string $notes = null,
        array $metadata = []
    ): self {
        $now = new DateTimeImmutable();
        $totalAmount = $appliedRate->calculateAmount($quantity);
        
        return new self(
            id: $id,
            supplierId: $supplierId,
            productId: $productId,
            userId: $userId,
            quantity: $quantity,
            appliedRate: $appliedRate,
            totalAmount: $totalAmount,
            collectionDate: $collectionDate,
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

    public function productId(): string
    {
        return $this->productId;
    }

    public function userId(): string
    {
        return $this->userId;
    }

    public function quantity(): Quantity
    {
        return $this->quantity;
    }

    public function appliedRate(): Rate
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

    public function updateMetadata(array $metadata): void
    {
        $this->metadata = $metadata;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'product_id' => $this->productId,
            'user_id' => $this->userId,
            'quantity' => $this->quantity->toArray(),
            'applied_rate' => $this->appliedRate->toArray(),
            'total_amount' => $this->totalAmount->toArray(),
            'collection_date' => $this->collectionDate->format('Y-m-d H:i:s'),
            'notes' => $this->notes,
            'metadata' => $this->metadata,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
