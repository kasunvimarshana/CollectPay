<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\Rate;
use Domain\ValueObjects\Unit;
use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Product Entity
 * 
 * Represents a product with versioned rates.
 */
class Product
{
    private array $rates = [];

    private function __construct(
        private string $id,
        private string $name,
        private string $description,
        private Unit $defaultUnit,
        private array $metadata,
        private bool $isActive,
        private DateTimeImmutable $createdAt,
        private DateTimeImmutable $updatedAt
    ) {
    }

    public static function create(
        string $id,
        string $name,
        string $description,
        Unit $defaultUnit,
        array $metadata = []
    ): self {
        $now = new DateTimeImmutable();
        
        return new self(
            id: $id,
            name: $name,
            description: $description,
            defaultUnit: $defaultUnit,
            metadata: $metadata,
            isActive: true,
            createdAt: $now,
            updatedAt: $now
        );
    }

    public function id(): string
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function description(): string
    {
        return $this->description;
    }

    public function defaultUnit(): Unit
    {
        return $this->defaultUnit;
    }

    public function metadata(): array
    {
        return $this->metadata;
    }

    public function rates(): array
    {
        return $this->rates;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function updateName(string $name): void
    {
        $this->name = $name;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateDescription(string $description): void
    {
        $this->description = $description;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateDefaultUnit(Unit $unit): void
    {
        $this->defaultUnit = $unit;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function addRate(Rate $rate): void
    {
        $this->rates[] = $rate;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function setRates(array $rates): void
    {
        foreach ($rates as $rate) {
            if (!$rate instanceof Rate) {
                throw new InvalidArgumentException('All items must be Rate instances');
            }
        }
        
        $this->rates = $rates;
        $this->updatedAt = new DateTimeImmutable();
    }

    /**
     * Get the applicable rate for a specific date
     */
    public function getRateAt(DateTimeImmutable $date): ?Rate
    {
        $applicableRates = array_filter(
            $this->rates,
            fn(Rate $rate) => $rate->isEffectiveAt($date)
        );

        if (empty($applicableRates)) {
            return null;
        }

        // Sort by effective date descending and get the most recent
        usort($applicableRates, function (Rate $a, Rate $b) {
            return $b->effectiveFrom() <=> $a->effectiveFrom();
        });

        return $applicableRates[0];
    }

    /**
     * Get the current applicable rate
     */
    public function getCurrentRate(): ?Rate
    {
        return $this->getRateAt(new DateTimeImmutable());
    }

    public function activate(): void
    {
        $this->isActive = true;
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
            'name' => $this->name,
            'description' => $this->description,
            'default_unit' => $this->defaultUnit->symbol(),
            'metadata' => $this->metadata,
            'rates' => array_map(fn(Rate $rate) => $rate->toArray(), $this->rates),
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
