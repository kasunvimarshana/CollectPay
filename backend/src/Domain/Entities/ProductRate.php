<?php

namespace App\Domain\Entities;

/**
 * ProductRate Entity
 * 
 * Represents a versioned rate for a product at a specific point in time.
 * Ensures immutability of historical rates - once created, rates are never modified.
 * New rates create new versions with effective dates.
 */
class ProductRate
{
    private ?int $id;
    private int $productId;
    private float $rate; // Price per unit
    private \DateTimeInterface $effectiveFrom;
    private ?\DateTimeInterface $effectiveTo;
    private bool $isActive;
    private int $version;
    private int $createdBy;
    private \DateTimeInterface $createdAt;

    public function __construct(
        int $productId,
        float $rate,
        \DateTimeInterface $effectiveFrom,
        int $createdBy,
        ?\DateTimeInterface $effectiveTo = null,
        bool $isActive = true,
        ?int $id = null,
        int $version = 1
    ) {
        $this->id = $id;
        $this->productId = $productId;
        $this->rate = $rate;
        $this->effectiveFrom = $effectiveFrom;
        $this->effectiveTo = $effectiveTo;
        $this->isActive = $isActive;
        $this->version = $version;
        $this->createdBy = $createdBy;
        $this->createdAt = new \DateTime();
    }

    // Getters
    public function getId(): ?int { return $this->id; }
    public function getProductId(): int { return $this->productId; }
    public function getRate(): float { return $this->rate; }
    public function getEffectiveFrom(): \DateTimeInterface { return $this->effectiveFrom; }
    public function getEffectiveTo(): ?\DateTimeInterface { return $this->effectiveTo; }
    public function isActive(): bool { return $this->isActive; }
    public function getVersion(): int { return $this->version; }
    public function getCreatedBy(): int { return $this->createdBy; }
    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }

    /**
     * Check if this rate is valid for a specific date
     */
    public function isValidForDate(\DateTimeInterface $date): bool
    {
        if (!$this->isActive) {
            return false;
        }

        $validFrom = $this->effectiveFrom <= $date;
        $validTo = $this->effectiveTo === null || $this->effectiveTo >= $date;

        return $validFrom && $validTo;
    }

    /**
     * Deactivate this rate (when a new rate supersedes it)
     */
    public function deactivate(\DateTimeInterface $effectiveTo): void
    {
        $this->effectiveTo = $effectiveTo;
        $this->isActive = false;
    }

    /**
     * Calculate amount for a given quantity
     */
    public function calculateAmount(float $quantity): float
    {
        return $quantity * $this->rate;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->productId,
            'rate' => $this->rate,
            'effective_from' => $this->effectiveFrom->format('Y-m-d H:i:s'),
            'effective_to' => $this->effectiveTo ? $this->effectiveTo->format('Y-m-d H:i:s') : null,
            'is_active' => $this->isActive,
            'version' => $this->version,
            'created_by' => $this->createdBy,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
        ];
    }
}
