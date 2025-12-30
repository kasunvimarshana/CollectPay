<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\Money;
use Domain\ValueObjects\Unit;
use DateTimeImmutable;

/**
 * Rate Entity
 * Represents a versioned rate for a product at a specific time
 */
final class Rate
{
    private string $id;
    private string $productId;
    private Money $ratePerUnit;
    private Unit $unit;
    private DateTimeImmutable $effectiveFrom;
    private ?DateTimeImmutable $effectiveTo;
    private bool $isActive;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;

    private function __construct(
        string $id,
        string $productId,
        Money $ratePerUnit,
        Unit $unit,
        DateTimeImmutable $effectiveFrom,
        ?DateTimeImmutable $effectiveTo = null,
        bool $isActive = true,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null
    ) {
        $this->id = $id;
        $this->productId = $productId;
        $this->ratePerUnit = $ratePerUnit;
        $this->unit = $unit;
        $this->effectiveFrom = $effectiveFrom;
        $this->effectiveTo = $effectiveTo;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
    }

    public static function create(
        string $id,
        string $productId,
        Money $ratePerUnit,
        Unit $unit,
        DateTimeImmutable $effectiveFrom
    ): self {
        return new self(
            $id,
            $productId,
            $ratePerUnit,
            $unit,
            $effectiveFrom
        );
    }

    public static function reconstitute(
        string $id,
        string $productId,
        Money $ratePerUnit,
        Unit $unit,
        DateTimeImmutable $effectiveFrom,
        ?DateTimeImmutable $effectiveTo,
        bool $isActive,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt
    ): self {
        return new self(
            $id,
            $productId,
            $ratePerUnit,
            $unit,
            $effectiveFrom,
            $effectiveTo,
            $isActive,
            $createdAt,
            $updatedAt
        );
    }

    // Getters
    public function getId(): string
    {
        return $this->id;
    }

    public function getProductId(): string
    {
        return $this->productId;
    }

    public function getRatePerUnit(): Money
    {
        return $this->ratePerUnit;
    }

    public function getUnit(): Unit
    {
        return $this->unit;
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

    // Business logic
    public function isEffectiveAt(DateTimeImmutable $date): bool
    {
        if ($date < $this->effectiveFrom) {
            return false;
        }

        if ($this->effectiveTo !== null && $date > $this->effectiveTo) {
            return false;
        }

        return $this->isActive;
    }

    public function expire(DateTimeImmutable $effectiveTo): void
    {
        $this->effectiveTo = $effectiveTo;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function deactivate(): void
    {
        $this->isActive = false;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->productId,
            'rate_per_unit' => $this->ratePerUnit->toArray(),
            'unit' => $this->unit->toString(),
            'effective_from' => $this->effectiveFrom->format('Y-m-d H:i:s'),
            'effective_to' => $this->effectiveTo?->format('Y-m-d H:i:s'),
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
