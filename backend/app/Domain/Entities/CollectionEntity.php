<?php

namespace App\Domain\Entities;

/**
 * Collection Domain Entity
 *
 * Represents a collection of products from a supplier.
 * This is a pure domain object with business logic and no framework dependencies.
 */
class CollectionEntity
{
    private ?int $id;

    private int $supplierId;

    private int $productId;

    private int $collectedBy;

    private float $quantity;

    private string $unit;

    private float $rate;

    private ?int $rateId;

    private float $totalAmount;

    private \DateTimeInterface $collectionDate;

    private ?string $collectionTime;

    private ?string $notes;

    private array $metadata;

    private int $version;

    private ?\DateTimeInterface $createdAt;

    private ?\DateTimeInterface $updatedAt;

    public function __construct(
        int $supplierId,
        int $productId,
        int $collectedBy,
        float $quantity,
        string $unit,
        float $rate,
        \DateTimeInterface $collectionDate,
        ?int $rateId = null,
        ?string $collectionTime = null,
        ?string $notes = null,
        array $metadata = [],
        int $version = 1,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null
    ) {
        $this->validateQuantity($quantity);
        $this->validateRate($rate);
        $this->validateUnit($unit);

        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->collectedBy = $collectedBy;
        $this->quantity = $quantity;
        $this->unit = $unit;
        $this->rate = $rate;
        $this->rateId = $rateId;
        $this->totalAmount = $this->calculateTotal();
        $this->collectionDate = $collectionDate;
        $this->collectionTime = $collectionTime;
        $this->notes = $notes;
        $this->metadata = $metadata;
        $this->version = $version;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
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

    public function getCollectedBy(): int
    {
        return $this->collectedBy;
    }

    public function getQuantity(): float
    {
        return $this->quantity;
    }

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function getRate(): float
    {
        return $this->rate;
    }

    public function getRateId(): ?int
    {
        return $this->rateId;
    }

    public function getTotalAmount(): float
    {
        return $this->totalAmount;
    }

    public function getCollectionDate(): \DateTimeInterface
    {
        return $this->collectionDate;
    }

    public function getCollectionTime(): ?string
    {
        return $this->collectionTime;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    // Business methods
    public function updateQuantity(float $quantity): void
    {
        $this->validateQuantity($quantity);
        $this->quantity = $quantity;
        $this->totalAmount = $this->calculateTotal();
        $this->incrementVersion();
    }

    public function updateRate(float $rate, ?int $rateId = null): void
    {
        $this->validateRate($rate);
        $this->rate = $rate;
        $this->rateId = $rateId;
        $this->totalAmount = $this->calculateTotal();
        $this->incrementVersion();
    }

    public function updateDetails(
        ?float $quantity = null,
        ?float $rate = null,
        ?int $rateId = null,
        ?string $notes = null
    ): void {
        $changed = false;

        if ($quantity !== null) {
            $this->validateQuantity($quantity);
            $this->quantity = $quantity;
            $changed = true;
        }

        if ($rate !== null) {
            $this->validateRate($rate);
            $this->rate = $rate;
            $changed = true;
        }

        if ($rateId !== null) {
            $this->rateId = $rateId;
            $changed = true;
        }

        if ($notes !== null) {
            $this->notes = $notes;
            $changed = true;
        }

        if ($changed) {
            $this->totalAmount = $this->calculateTotal();
            $this->incrementVersion();
        }
    }

    public function updateMetadata(array $metadata): void
    {
        $this->metadata = array_merge($this->metadata, $metadata);
        $this->incrementVersion();
    }

    public function incrementVersion(): void
    {
        $this->version++;
    }

    // Private helper methods
    private function calculateTotal(): float
    {
        return round($this->quantity * $this->rate, 4);
    }

    // Validation methods (business rules)
    private function validateQuantity(float $quantity): void
    {
        if ($quantity < 0) {
            throw new \InvalidArgumentException('Quantity cannot be negative');
        }
    }

    private function validateRate(float $rate): void
    {
        if ($rate < 0) {
            throw new \InvalidArgumentException('Rate cannot be negative');
        }
    }

    private function validateUnit(string $unit): void
    {
        $validUnits = ['kg', 'g', 'l', 'ml', 'unit', 'lb', 'oz', 't'];
        if (! in_array($unit, $validUnits)) {
            throw new \InvalidArgumentException('Invalid unit. Must be one of: '.implode(', ', $validUnits));
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'product_id' => $this->productId,
            'collected_by' => $this->collectedBy,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'rate' => $this->rate,
            'rate_id' => $this->rateId,
            'total_amount' => $this->totalAmount,
            'collection_date' => $this->collectionDate->format('Y-m-d'),
            'collection_time' => $this->collectionTime,
            'notes' => $this->notes,
            'metadata' => $this->metadata,
            'version' => $this->version,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
