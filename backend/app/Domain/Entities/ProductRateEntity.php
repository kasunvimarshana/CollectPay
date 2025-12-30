<?php

namespace App\Domain\Entities;

/**
 * ProductRate Domain Entity
 *
 * Represents a time-based rate for a product.
 * This is a pure domain object with business logic and no framework dependencies.
 */
class ProductRateEntity
{
    private ?int $id;

    private int $productId;

    private float $rate;

    private string $unit;

    private \DateTimeInterface $effectiveFrom;

    private ?\DateTimeInterface $effectiveTo;

    private bool $isActive;

    private ?string $notes;

    private int $version;

    private ?\DateTimeInterface $createdAt;

    private ?\DateTimeInterface $updatedAt;

    public function __construct(
        int $productId,
        float $rate,
        string $unit,
        \DateTimeInterface $effectiveFrom,
        ?\DateTimeInterface $effectiveTo = null,
        bool $isActive = true,
        ?string $notes = null,
        int $version = 1,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null
    ) {
        $this->validateRate($rate);
        $this->validateUnit($unit);
        $this->validateDateRange($effectiveFrom, $effectiveTo);

        $this->id = $id;
        $this->productId = $productId;
        $this->rate = $rate;
        $this->unit = $unit;
        $this->effectiveFrom = $effectiveFrom;
        $this->effectiveTo = $effectiveTo;
        $this->isActive = $isActive;
        $this->notes = $notes;
        $this->version = $version;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
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

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function getEffectiveFrom(): \DateTimeInterface
    {
        return $this->effectiveFrom;
    }

    public function getEffectiveTo(): ?\DateTimeInterface
    {
        return $this->effectiveTo;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
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
    public function isEffectiveOn(\DateTimeInterface $date): bool
    {
        $dateStr = $date->format('Y-m-d');
        $fromStr = $this->effectiveFrom->format('Y-m-d');
        $toStr = $this->effectiveTo?->format('Y-m-d');

        return $this->isActive
            && $dateStr >= $fromStr
            && ($toStr === null || $dateStr <= $toStr);
    }

    public function isCurrentlyEffective(): bool
    {
        return $this->isEffectiveOn(new \DateTime());
    }

    public function activate(): void
    {
        $this->isActive = true;
        $this->incrementVersion();
    }

    public function deactivate(): void
    {
        $this->isActive = false;
        $this->incrementVersion();
    }

    public function updateRate(float $newRate): void
    {
        $this->validateRate($newRate);
        $this->rate = $newRate;
        $this->incrementVersion();
    }

    public function setEffectiveTo(\DateTimeInterface $date): void
    {
        $this->validateDateRange($this->effectiveFrom, $date);
        $this->effectiveTo = $date;
        $this->incrementVersion();
    }

    public function incrementVersion(): void
    {
        $this->version++;
    }

    // Validation methods (business rules)
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

    private function validateDateRange(\DateTimeInterface $from, ?\DateTimeInterface $to): void
    {
        if ($to !== null && $to < $from) {
            throw new \InvalidArgumentException('Effective-to date must be after effective-from date');
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->productId,
            'rate' => $this->rate,
            'unit' => $this->unit,
            'effective_from' => $this->effectiveFrom->format('Y-m-d'),
            'effective_to' => $this->effectiveTo?->format('Y-m-d'),
            'is_active' => $this->isActive,
            'notes' => $this->notes,
            'version' => $this->version,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
