<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Entities;

use DateTimeImmutable;

/**
 * ProductRate Entity
 * 
 * Represents a versioned rate for a product.
 * Maintains historical rates for auditing and accurate calculations.
 */
final class ProductRate
{
    private ?int $id;
    private int $productId;
    private float $rate;
    private DateTimeImmutable $effectiveFrom;
    private ?DateTimeImmutable $effectiveTo;
    private bool $isActive;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;

    public function __construct(
        int $productId,
        float $rate,
        DateTimeImmutable $effectiveFrom,
        ?DateTimeImmutable $effectiveTo = null,
        bool $isActive = true,
        ?int $id = null,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null
    ) {
        $this->validateRate($rate);
        $this->validateDateRange($effectiveFrom, $effectiveTo);
        
        $this->id = $id;
        $this->productId = $productId;
        $this->rate = $rate;
        $this->effectiveFrom = $effectiveFrom;
        $this->effectiveTo = $effectiveTo;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
    }

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

    public function getEffectiveFrom(): DateTimeImmutable
    {
        return $this->effectiveFrom;
    }

    public function getEffectiveTo(): ?DateTimeImmutable
    {
        return $this->effectiveTo;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function isValidForDate(DateTimeImmutable $date): bool
    {
        $afterStart = $date >= $this->effectiveFrom;
        $beforeEnd = $this->effectiveTo === null || $date < $this->effectiveTo;
        
        return $this->isActive && $afterStart && $beforeEnd;
    }

    public function expire(DateTimeImmutable $effectiveTo): void
    {
        $this->validateDateRange($this->effectiveFrom, $effectiveTo);
        $this->effectiveTo = $effectiveTo;
        $this->isActive = false;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->productId,
            'rate' => $this->rate,
            'effective_from' => $this->effectiveFrom->format('Y-m-d H:i:s'),
            'effective_to' => $this->effectiveTo?->format('Y-m-d H:i:s'),
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s')
        ];
    }

    private function validateRate(float $rate): void
    {
        if ($rate < 0) {
            throw new \InvalidArgumentException('Rate cannot be negative');
        }
    }

    private function validateDateRange(
        DateTimeImmutable $effectiveFrom,
        ?DateTimeImmutable $effectiveTo
    ): void {
        if ($effectiveTo !== null && $effectiveTo <= $effectiveFrom) {
            throw new \InvalidArgumentException(
                'Effective to date must be after effective from date'
            );
        }
    }
}
