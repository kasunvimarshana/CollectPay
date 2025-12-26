<?php

namespace App\Domain\Entities;

use App\Domain\ValueObjects\Money;

/**
 * Collection Domain Entity
 * 
 * Represents a collection of product from a supplier.
 * Contains business logic for collection validation and amount calculation.
 */
class CollectionEntity
{
    private ?int $id;
    private int $supplierId;
    private int $productId;
    private int $userId;
    private ?int $productRateId;
    private \DateTimeImmutable $collectionDate;
    private float $quantity;
    private string $unit;
    private float $rateApplied;
    private float $totalAmount;
    private ?string $notes;
    private ?array $metadata;
    private int $version;

    public function __construct(
        int $supplierId,
        int $productId,
        int $userId,
        \DateTimeImmutable $collectionDate,
        float $quantity,
        string $unit,
        float $rateApplied,
        ?int $productRateId = null,
        ?string $notes = null,
        ?array $metadata = null,
        int $version = 1,
        ?int $id = null
    ) {
        $this->validateQuantity($quantity);
        $this->validateUnit($unit);
        $this->validateRate($rateApplied);

        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->userId = $userId;
        $this->productRateId = $productRateId;
        $this->collectionDate = $collectionDate;
        $this->quantity = $quantity;
        $this->unit = $unit;
        $this->rateApplied = $rateApplied;
        $this->notes = $notes;
        $this->metadata = $metadata;
        $this->version = $version;

        // Calculate total amount
        $this->totalAmount = $this->calculateTotalAmount();
    }

    // Getters
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

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getProductRateId(): ?int
    {
        return $this->productRateId;
    }

    public function getCollectionDate(): \DateTimeImmutable
    {
        return $this->collectionDate;
    }

    public function getQuantity(): float
    {
        return $this->quantity;
    }

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function getRateApplied(): float
    {
        return $this->rateApplied;
    }

    public function getTotalAmount(): float
    {
        return $this->totalAmount;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    // Business methods
    public function updateQuantity(float $quantity): void
    {
        $this->validateQuantity($quantity);
        $this->quantity = $quantity;
        $this->totalAmount = $this->calculateTotalAmount();
    }

    public function updateRate(float $rate, ?int $productRateId = null): void
    {
        $this->validateRate($rate);
        $this->rateApplied = $rate;
        $this->productRateId = $productRateId;
        $this->totalAmount = $this->calculateTotalAmount();
    }

    public function updateNotes(?string $notes): void
    {
        $this->notes = $notes;
    }

    public function incrementVersion(): void
    {
        $this->version++;
    }

    public function getTotalAmountAsMoney(string $currency = 'USD'): Money
    {
        return new Money($this->totalAmount, $currency);
    }

    // Private methods
    private function calculateTotalAmount(): float
    {
        return round($this->quantity * $this->rateApplied, 2);
    }

    // Validation methods
    private function validateQuantity(float $quantity): void
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than zero');
        }

        if ($quantity < 0.001) {
            throw new \InvalidArgumentException('Quantity must be at least 0.001');
        }
    }

    private function validateUnit(string $unit): void
    {
        if (empty(trim($unit))) {
            throw new \InvalidArgumentException('Unit cannot be empty');
        }

        if (strlen($unit) > 50) {
            throw new \InvalidArgumentException('Unit cannot exceed 50 characters');
        }
    }

    private function validateRate(float $rate): void
    {
        if ($rate < 0) {
            throw new \InvalidArgumentException('Rate cannot be negative');
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'product_id' => $this->productId,
            'user_id' => $this->userId,
            'product_rate_id' => $this->productRateId,
            'collection_date' => $this->collectionDate->format('Y-m-d'),
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'rate_applied' => $this->rateApplied,
            'total_amount' => $this->totalAmount,
            'notes' => $this->notes,
            'metadata' => $this->metadata,
            'version' => $this->version,
        ];
    }
}
