<?php

namespace App\Domain\Entities;

/**
 * Collection Domain Entity
 * 
 * Represents a collection record from a supplier.
 * Supports multi-unit quantities and preserves the rate applied
 * at the time of collection for accurate historical tracking.
 * 
 * Following Clean Architecture principles - pure domain entity.
 */
class Collection
{
    private ?int $id;
    private int $supplierId;
    private int $productId;
    private float $quantity;
    private string $unit;
    private float $appliedRate;
    private float $totalAmount;
    private \DateTimeInterface $collectionDate;
    private int $collectedBy;
    private ?string $notes;
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;
    private ?int $version;

    public function __construct(
        int $supplierId,
        int $productId,
        float $quantity,
        string $unit,
        float $appliedRate,
        \DateTimeInterface $collectionDate,
        int $collectedBy,
        ?string $notes = null,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null,
        ?int $version = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->quantity = $quantity;
        $this->unit = $unit;
        $this->appliedRate = $appliedRate;
        $this->totalAmount = $this->calculateTotalAmount();
        $this->collectionDate = $collectionDate;
        $this->collectedBy = $collectedBy;
        $this->notes = $notes;
        $this->createdAt = $createdAt ?? new \DateTime();
        $this->updatedAt = $updatedAt ?? new \DateTime();
        $this->version = $version ?? 0;
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

    public function getQuantity(): float
    {
        return $this->quantity;
    }

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function getAppliedRate(): float
    {
        return $this->appliedRate;
    }

    public function getTotalAmount(): float
    {
        return $this->totalAmount;
    }

    public function getCollectionDate(): \DateTimeInterface
    {
        return $this->collectionDate;
    }

    public function getCollectedBy(): int
    {
        return $this->collectedBy;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function getVersion(): ?int
    {
        return $this->version;
    }

    // Business logic methods
    private function calculateTotalAmount(): float
    {
        return round($this->quantity * $this->appliedRate, 2);
    }

    public function updateQuantity(float $newQuantity): void
    {
        if ($newQuantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive');
        }
        
        $this->quantity = $newQuantity;
        $this->totalAmount = $this->calculateTotalAmount();
        $this->touch();
    }

    public function updateRate(float $newRate): void
    {
        if ($newRate <= 0) {
            throw new \InvalidArgumentException('Rate must be positive');
        }
        
        $this->appliedRate = $newRate;
        $this->totalAmount = $this->calculateTotalAmount();
        $this->touch();
    }

    public function updateNotes(?string $notes): void
    {
        $this->notes = $notes;
        $this->touch();
    }

    private function touch(): void
    {
        $this->updatedAt = new \DateTime();
        $this->version = ($this->version ?? 0) + 1;
    }

    // Factory method
    public static function create(
        int $supplierId,
        int $productId,
        float $quantity,
        string $unit,
        float $rate,
        \DateTimeInterface $collectionDate,
        int $collectedBy,
        ?string $notes = null
    ): self {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive');
        }
        
        if ($rate <= 0) {
            throw new \InvalidArgumentException('Rate must be positive');
        }

        return new self(
            supplierId: $supplierId,
            productId: $productId,
            quantity: $quantity,
            unit: $unit,
            appliedRate: $rate,
            collectionDate: $collectionDate,
            collectedBy: $collectedBy,
            notes: $notes
        );
    }

    // Validation
    public function validate(): array
    {
        $errors = [];

        if ($this->supplierId <= 0) {
            $errors[] = 'Supplier ID is required';
        }

        if ($this->productId <= 0) {
            $errors[] = 'Product ID is required';
        }

        if ($this->quantity <= 0) {
            $errors[] = 'Quantity must be positive';
        }

        if (empty(trim($this->unit))) {
            $errors[] = 'Unit is required';
        }

        if ($this->appliedRate <= 0) {
            $errors[] = 'Applied rate must be positive';
        }

        if ($this->collectedBy <= 0) {
            $errors[] = 'Collector user ID is required';
        }

        return $errors;
    }

    public function isValid(): bool
    {
        return empty($this->validate());
    }

    // Unit conversion helper
    public function convertTo(string $targetUnit, array $conversionRates = []): float
    {
        if ($this->unit === $targetUnit) {
            return $this->quantity;
        }

        // Default conversion rates (can be overridden)
        $defaultRates = [
            'kg_to_g' => 1000,
            'g_to_kg' => 0.001,
            'l_to_ml' => 1000,
            'ml_to_l' => 0.001,
        ];

        $rates = array_merge($defaultRates, $conversionRates);
        $conversionKey = "{$this->unit}_to_{$targetUnit}";

        if (isset($rates[$conversionKey])) {
            return round($this->quantity * $rates[$conversionKey], 3);
        }

        throw new \InvalidArgumentException("Conversion from {$this->unit} to {$targetUnit} not supported");
    }
}
