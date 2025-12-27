<?php

declare(strict_types=1);

namespace TrackVault\Domain\Entities;

use TrackVault\Domain\ValueObjects\ProductId;
use TrackVault\Domain\ValueObjects\Money;
use DateTimeImmutable;

/**
 * Product Entity
 * 
 * Represents a product with versioned rates and multi-unit support
 */
final class Product
{
    private ProductId $id;
    private string $name;
    private string $description;
    private string $unit;
    private array $rates; // Array of ProductRate value objects
    private array $metadata;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;
    private int $version;

    public function __construct(
        ProductId $id,
        string $name,
        string $description,
        string $unit,
        array $rates = [],
        array $metadata = [],
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null,
        int $version = 1
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->unit = $unit;
        $this->rates = $rates;
        $this->metadata = $metadata;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
        $this->version = $version;
    }

    public function getId(): ProductId
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function getRates(): array
    {
        return $this->rates;
    }

    public function getCurrentRate(?DateTimeImmutable $effectiveDate = null): ?Money
    {
        $effectiveDate = $effectiveDate ?? new DateTimeImmutable();
        
        $applicableRates = array_filter(
            $this->rates,
            fn($rate) => $rate['effective_from'] <= $effectiveDate && 
                        ($rate['effective_to'] === null || $rate['effective_to'] >= $effectiveDate)
        );

        if (empty($applicableRates)) {
            return null;
        }

        usort($applicableRates, fn($a, $b) => $b['effective_from'] <=> $a['effective_from']);
        
        return new Money($applicableRates[0]['amount'], $applicableRates[0]['currency']);
    }

    public function getMetadata(): array
    {
        return $this->metadata;
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

    public function getVersion(): int
    {
        return $this->version;
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }

    public function addRate(Money $amount, DateTimeImmutable $effectiveFrom, ?DateTimeImmutable $effectiveTo = null): self
    {
        $newRates = $this->rates;
        $newRates[] = [
            'amount' => $amount->getAmount(),
            'currency' => $amount->getCurrency(),
            'effective_from' => $effectiveFrom,
            'effective_to' => $effectiveTo,
        ];

        return new self(
            $this->id,
            $this->name,
            $this->description,
            $this->unit,
            $newRates,
            $this->metadata,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->deletedAt,
            $this->version + 1
        );
    }

    public function update(string $name, string $description, string $unit, array $metadata): self
    {
        return new self(
            $this->id,
            $name,
            $description,
            $unit,
            $this->rates,
            $metadata,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->deletedAt,
            $this->version + 1
        );
    }

    public function delete(): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->description,
            $this->unit,
            $this->rates,
            $this->metadata,
            $this->createdAt,
            new DateTimeImmutable(),
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->toString(),
            'name' => $this->name,
            'description' => $this->description,
            'unit' => $this->unit,
            'rates' => $this->rates,
            'metadata' => $this->metadata,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
            'version' => $this->version,
        ];
    }
}
