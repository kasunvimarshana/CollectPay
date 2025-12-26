<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

/**
 * RateVersion Entity
 * Represents a versioned rate for a product
 * Historical rates are preserved for accurate payment calculations
 */
class RateVersion
{
    private string $id;
    private string $productId;
    private float $rate; // Rate per unit
    private DateTimeImmutable $effectiveFrom;
    private ?DateTimeImmutable $effectiveTo;
    private string $userId; // User who set this rate
    private int $version;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    public function __construct(
        string $id,
        string $productId,
        float $rate,
        DateTimeImmutable $effectiveFrom,
        string $userId,
        ?DateTimeImmutable $effectiveTo = null,
        int $version = 1,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->id = $id;
        $this->productId = $productId;
        $this->rate = $rate;
        $this->effectiveFrom = $effectiveFrom;
        $this->effectiveTo = $effectiveTo;
        $this->userId = $userId;
        $this->version = $version;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getProductId(): string
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

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function isActiveAt(DateTimeImmutable $date): bool
    {
        $isAfterStart = $date >= $this->effectiveFrom;
        $isBeforeEnd = $this->effectiveTo === null || $date <= $this->effectiveTo;
        
        return $isAfterStart && $isBeforeEnd;
    }

    public function incrementVersion(): void
    {
        $this->version++;
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
            'user_id' => $this->userId,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
