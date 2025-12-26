<?php

namespace App\Domain\Entities;

/**
 * ProductRate Domain Entity
 * 
 * Represents a historical product rate with version tracking.
 * This enables accurate historical calculations and audit trails,
 * preserving the exact rate applied at the time of each collection.
 * 
 * Following Clean Architecture principles - pure domain entity.
 */
class ProductRate
{
    private ?int $id;
    private int $productId;
    private float $rate;
    private \DateTimeInterface $effectiveFrom;
    private ?\DateTimeInterface $effectiveTo;
    private string $unit;
    private ?string $notes;
    private int $createdBy;
    private \DateTimeInterface $createdAt;

    public function __construct(
        int $productId,
        float $rate,
        \DateTimeInterface $effectiveFrom,
        string $unit,
        int $createdBy,
        ?\DateTimeInterface $effectiveTo = null,
        ?string $notes = null,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null
    ) {
        $this->id = $id;
        $this->productId = $productId;
        $this->rate = $rate;
        $this->effectiveFrom = $effectiveFrom;
        $this->effectiveTo = $effectiveTo;
        $this->unit = $unit;
        $this->notes = $notes;
        $this->createdBy = $createdBy;
        $this->createdAt = $createdAt ?? new \DateTime();
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProductId(): int
    {
        return $this->productId;
    }

    public function getRate(): float
    {
        return $this->rate;
    }

    public function getEffectiveFrom(): \DateTimeInterface
    {
        return $this->effectiveFrom;
    }

    public function getEffectiveTo(): ?\DateTimeInterface
    {
        return $this->effectiveTo;
    }

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getCreatedBy(): int
    {
        return $this->createdBy;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    // Business logic methods
    public function isEffectiveAt(\DateTimeInterface $date): bool
    {
        $isAfterStart = $date >= $this->effectiveFrom;
        $isBeforeEnd = $this->effectiveTo === null || $date <= $this->effectiveTo;
        
        return $isAfterStart && $isBeforeEnd;
    }

    public function isCurrentlyEffective(): bool
    {
        return $this->isEffectiveAt(new \DateTime());
    }

    public function expire(\DateTimeInterface $expirationDate): void
    {
        if ($expirationDate < $this->effectiveFrom) {
            throw new \InvalidArgumentException('Expiration date cannot be before effective from date');
        }
        
        $this->effectiveTo = $expirationDate;
    }

    public function calculateAmount(float $quantity): float
    {
        return round($this->rate * $quantity, 2);
    }

    // Factory method
    public static function create(
        int $productId,
        float $rate,
        \DateTimeInterface $effectiveFrom,
        string $unit,
        int $createdBy,
        ?string $notes = null
    ): self {
        if ($rate <= 0) {
            throw new \InvalidArgumentException('Rate must be positive');
        }

        return new self(
            productId: $productId,
            rate: $rate,
            effectiveFrom: $effectiveFrom,
            unit: $unit,
            createdBy: $createdBy,
            notes: $notes
        );
    }

    // Validation
    public function validate(): array
    {
        $errors = [];

        if ($this->productId <= 0) {
            $errors[] = 'Product ID is required';
        }

        if ($this->rate <= 0) {
            $errors[] = 'Rate must be positive';
        }

        if (empty(trim($this->unit))) {
            $errors[] = 'Unit is required';
        }

        if ($this->effectiveTo && $this->effectiveTo < $this->effectiveFrom) {
            $errors[] = 'Effective to date must be after effective from date';
        }

        return $errors;
    }

    public function isValid(): bool
    {
        return empty($this->validate());
    }
}
