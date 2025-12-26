<?php

namespace App\Domain\Entities;

use App\Domain\ValueObjects\Money;

/**
 * ProductRate Domain Entity
 * 
 * Represents a versioned rate for a product unit.
 * Contains business logic for rate validation and effective date management.
 */
class ProductRateEntity
{
    private ?int $id;
    private int $productId;
    private string $unit;
    private float $rate;
    private \DateTimeImmutable $effectiveDate;
    private ?\DateTimeImmutable $endDate;
    private bool $isActive;
    private ?array $metadata;
    private int $version;

    public function __construct(
        int $productId,
        string $unit,
        float $rate,
        \DateTimeImmutable $effectiveDate,
        ?\DateTimeImmutable $endDate = null,
        bool $isActive = true,
        ?array $metadata = null,
        int $version = 1,
        ?int $id = null
    ) {
        $this->validateUnit($unit);
        $this->validateRate($rate);
        $this->validateDateRange($effectiveDate, $endDate);

        $this->id = $id;
        $this->productId = $productId;
        $this->unit = $unit;
        $this->rate = $rate;
        $this->effectiveDate = $effectiveDate;
        $this->endDate = $endDate;
        $this->isActive = $isActive;
        $this->metadata = $metadata;
        $this->version = $version;
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

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function getRate(): float
    {
        return $this->rate;
    }

    public function getEffectiveDate(): \DateTimeImmutable
    {
        return $this->effectiveDate;
    }

    public function getEndDate(): ?\DateTimeImmutable
    {
        return $this->endDate;
    }

    public function isActive(): bool
    {
        return $this->isActive;
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
    public function updateRate(float $newRate): void
    {
        $this->validateRate($newRate);
        $this->rate = $newRate;
    }

    public function setEndDate(\DateTimeImmutable $endDate): void
    {
        $this->validateDateRange($this->effectiveDate, $endDate);
        $this->endDate = $endDate;
    }

    public function activate(): void
    {
        $this->isActive = true;
    }

    public function deactivate(): void
    {
        $this->isActive = false;
    }

    public function incrementVersion(): void
    {
        $this->version++;
    }

    public function isEffectiveOn(\DateTimeImmutable $date): bool
    {
        if (!$this->isActive) {
            return false;
        }

        // Check if date is on or after effective date
        if ($date < $this->effectiveDate) {
            return false;
        }

        // Check if date is before end date (if set)
        if ($this->endDate !== null && $date > $this->endDate) {
            return false;
        }

        return true;
    }

    public function isCurrentlyEffective(): bool
    {
        return $this->isEffectiveOn(new \DateTimeImmutable());
    }

    public function getRateAsMoney(string $currency = 'USD'): Money
    {
        return new Money($this->rate, $currency);
    }

    // Validation methods
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

    private function validateDateRange(
        \DateTimeImmutable $effectiveDate,
        ?\DateTimeImmutable $endDate
    ): void {
        if ($endDate !== null && $endDate < $effectiveDate) {
            throw new \InvalidArgumentException('End date cannot be before effective date');
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->productId,
            'unit' => $this->unit,
            'rate' => $this->rate,
            'effective_date' => $this->effectiveDate->format('Y-m-d'),
            'end_date' => $this->endDate?->format('Y-m-d'),
            'is_active' => $this->isActive,
            'metadata' => $this->metadata,
            'version' => $this->version,
        ];
    }
}
