<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\UUID;
use Domain\ValueObjects\Money;
use DateTimeImmutable;
use InvalidArgumentException;

/**
 * ProductRate Domain Entity
 * 
 * Represents a versioned rate for a product
 * Historical rates are immutable for audit purposes
 */
final class ProductRate
{
    private UUID $id;
    private UUID $productId;
    private Money $rate;
    private DateTimeImmutable $effectiveFrom;
    private ?DateTimeImmutable $effectiveTo;
    private bool $active;
    private DateTimeImmutable $createdAt;
    private int $version;

    private function __construct(
        UUID $id,
        UUID $productId,
        Money $rate,
        DateTimeImmutable $effectiveFrom,
        ?DateTimeImmutable $effectiveTo,
        bool $active,
        DateTimeImmutable $createdAt,
        int $version
    ) {
        $this->validateEffectiveDates($effectiveFrom, $effectiveTo);
        
        $this->id = $id;
        $this->productId = $productId;
        $this->rate = $rate;
        $this->effectiveFrom = $effectiveFrom;
        $this->effectiveTo = $effectiveTo;
        $this->active = $active;
        $this->createdAt = $createdAt;
        $this->version = $version;
    }

    public static function create(
        UUID $productId,
        Money $rate,
        DateTimeImmutable $effectiveFrom
    ): self {
        return new self(
            UUID::generate(),
            $productId,
            $rate,
            $effectiveFrom,
            null,
            true,
            new DateTimeImmutable(),
            1
        );
    }

    public static function reconstitute(
        string $id,
        string $productId,
        float $rateAmount,
        string $currency,
        DateTimeImmutable $effectiveFrom,
        ?DateTimeImmutable $effectiveTo,
        bool $active,
        DateTimeImmutable $createdAt,
        int $version
    ): self {
        return new self(
            UUID::fromString($id),
            UUID::fromString($productId),
            new Money($rateAmount, $currency),
            $effectiveFrom,
            $effectiveTo,
            $active,
            $createdAt,
            $version
        );
    }

    public function expire(DateTimeImmutable $effectiveTo): self
    {
        if ($this->effectiveTo !== null) {
            throw new InvalidArgumentException('Rate has already been expired');
        }

        if ($effectiveTo <= $this->effectiveFrom) {
            throw new InvalidArgumentException('Expiry date must be after effective from date');
        }

        return new self(
            $this->id,
            $this->productId,
            $this->rate,
            $this->effectiveFrom,
            $effectiveTo,
            false,
            $this->createdAt,
            $this->version + 1
        );
    }

    public function isEffectiveOn(DateTimeImmutable $date): bool
    {
        if (!$this->active) {
            return false;
        }

        if ($date < $this->effectiveFrom) {
            return false;
        }

        if ($this->effectiveTo !== null && $date >= $this->effectiveTo) {
            return false;
        }

        return true;
    }

    private function validateEffectiveDates(
        DateTimeImmutable $effectiveFrom,
        ?DateTimeImmutable $effectiveTo
    ): void {
        if ($effectiveTo !== null && $effectiveTo <= $effectiveFrom) {
            throw new InvalidArgumentException('Effective to date must be after effective from date');
        }
    }

    // Getters
    public function id(): UUID
    {
        return $this->id;
    }

    public function productId(): UUID
    {
        return $this->productId;
    }

    public function rate(): Money
    {
        return $this->rate;
    }

    public function effectiveFrom(): DateTimeImmutable
    {
        return $this->effectiveFrom;
    }

    public function effectiveTo(): ?DateTimeImmutable
    {
        return $this->effectiveTo;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function version(): int
    {
        return $this->version;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'product_id' => $this->productId->value(),
            'rate_amount' => $this->rate->amount(),
            'currency' => $this->rate->currency(),
            'effective_from' => $this->effectiveFrom->format('Y-m-d H:i:s'),
            'effective_to' => $this->effectiveTo?->format('Y-m-d H:i:s'),
            'active' => $this->active,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'version' => $this->version,
        ];
    }
}
