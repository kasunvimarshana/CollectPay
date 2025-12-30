<?php

namespace App\Domain\Entities;

use App\Domain\ValueObjects\Money;
use DateTime;

/**
 * ProductRate Entity
 * 
 * Represents a product rate with versioning and time-based validity.
 * Historical rates are preserved for auditing and accurate calculations.
 */
class ProductRate
{
    private ?int $id;
    private int $productId;
    private Money $rate;
    private DateTime $effectiveFrom;
    private ?DateTime $effectiveTo;
    private int $version;
    private bool $isActive;
    private DateTime $createdAt;
    private ?int $createdBy;

    public function __construct(
        int $productId,
        Money $rate,
        DateTime $effectiveFrom,
        int $version = 1,
        ?DateTime $effectiveTo = null,
        bool $isActive = true,
        ?int $id = null,
        ?DateTime $createdAt = null,
        ?int $createdBy = null
    ) {
        $this->id = $id;
        $this->productId = $productId;
        $this->rate = $rate;
        $this->effectiveFrom = $effectiveFrom;
        $this->effectiveTo = $effectiveTo;
        $this->version = $version;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new DateTime();
        $this->createdBy = $createdBy;
        
        $this->validate();
    }

    private function validate(): void
    {
        if ($this->productId <= 0) {
            throw new \InvalidArgumentException('Product ID must be positive');
        }
        
        if ($this->version < 1) {
            throw new \InvalidArgumentException('Version must be at least 1');
        }
        
        if ($this->effectiveTo !== null && $this->effectiveTo <= $this->effectiveFrom) {
            throw new \InvalidArgumentException('Effective to date must be after effective from date');
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProductId(): int
    {
        return $this->productId;
    }

    public function getRate(): Money
    {
        return $this->rate;
    }

    public function getEffectiveFrom(): DateTime
    {
        return $this->effectiveFrom;
    }

    public function getEffectiveTo(): ?DateTime
    {
        return $this->effectiveTo;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getCreatedAt(): DateTime
    {
        return $this->createdAt;
    }

    public function getCreatedBy(): ?int
    {
        return $this->createdBy;
    }

    /**
     * Check if this rate is valid for a given date
     */
    public function isValidOn(DateTime $date): bool
    {
        if (!$this->isActive) {
            return false;
        }

        $isAfterFrom = $date >= $this->effectiveFrom;
        $isBeforeTo = $this->effectiveTo === null || $date < $this->effectiveTo;

        return $isAfterFrom && $isBeforeTo;
    }

    /**
     * Expire this rate (set effective to date)
     */
    public function expire(DateTime $effectiveTo): void
    {
        if ($effectiveTo <= $this->effectiveFrom) {
            throw new \InvalidArgumentException('Expiry date must be after effective from date');
        }
        
        $this->effectiveTo = $effectiveTo;
        $this->isActive = false;
    }

    /**
     * Deactivate this rate
     */
    public function deactivate(): void
    {
        $this->isActive = false;
        
        if ($this->effectiveTo === null) {
            $this->effectiveTo = new DateTime();
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->productId,
            'rate_amount' => $this->rate->getAmount(),
            'rate_currency' => $this->rate->getCurrency(),
            'effective_from' => $this->effectiveFrom->format('Y-m-d H:i:s'),
            'effective_to' => $this->effectiveTo ? $this->effectiveTo->format('Y-m-d H:i:s') : null,
            'version' => $this->version,
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'created_by' => $this->createdBy,
        ];
    }
}
