<?php

namespace App\Domain\Entities;

/**
 * Product Domain Entity
 * 
 * Represents a product in the system with multi-unit support
 * and versioned rate management for accurate historical tracking.
 * 
 * Following Clean Architecture principles - pure domain entity.
 */
class Product
{
    private ?int $id;
    private string $name;
    private string $code;
    private ?string $description;
    private string $unit; // kg, g, liters, etc.
    private float $currentRate;
    private bool $isActive;
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;
    private ?int $version;

    public function __construct(
        string $name,
        string $code,
        string $unit,
        float $currentRate,
        ?string $description = null,
        bool $isActive = true,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null,
        ?int $version = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->description = $description;
        $this->unit = $unit;
        $this->currentRate = $currentRate;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new \DateTime();
        $this->updatedAt = $updatedAt ?? new \DateTime();
        $this->version = $version ?? 0;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function getCurrentRate(): float
    {
        return $this->currentRate;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function getVersion(): ?int
    {
        return $this->version;
    }

    // Business logic methods
    public function updateDetails(
        ?string $name = null,
        ?string $description = null,
        ?string $unit = null
    ): void {
        if ($name !== null) {
            $this->name = $name;
        }
        if ($description !== null) {
            $this->description = $description;
        }
        if ($unit !== null) {
            $this->unit = $unit;
        }
        
        $this->touch();
    }

    public function updateRate(float $newRate): void
    {
        if ($newRate <= 0) {
            throw new \InvalidArgumentException('Rate must be positive');
        }
        
        $this->currentRate = $newRate;
        $this->touch();
    }

    public function calculateAmount(float $quantity): float
    {
        return round($this->currentRate * $quantity, 2);
    }

    public function activate(): void
    {
        $this->isActive = true;
        $this->touch();
    }

    public function deactivate(): void
    {
        $this->isActive = false;
        $this->touch();
    }

    private function touch(): void
    {
        $this->updatedAt = new \DateTime();
        $this->version = ($this->version ?? 0) + 1;
    }

    // Factory method
    public static function create(
        string $name,
        string $code,
        string $unit,
        float $rate,
        ?string $description = null
    ): self {
        if ($rate <= 0) {
            throw new \InvalidArgumentException('Rate must be positive');
        }

        return new self(
            name: $name,
            code: $code,
            unit: $unit,
            currentRate: $rate,
            description: $description
        );
    }

    // Validation
    public function validate(): array
    {
        $errors = [];

        if (empty(trim($this->name))) {
            $errors[] = 'Product name is required';
        }

        if (empty(trim($this->code))) {
            $errors[] = 'Product code is required';
        }

        if (empty(trim($this->unit))) {
            $errors[] = 'Unit is required';
        }

        if ($this->currentRate <= 0) {
            $errors[] = 'Rate must be positive';
        }

        return $errors;
    }

    public function isValid(): bool
    {
        return empty($this->validate());
    }

    // Supported units
    public static function getSupportedUnits(): array
    {
        return [
            'kg' => 'Kilogram',
            'g' => 'Gram',
            'l' => 'Liter',
            'ml' => 'Milliliter',
            'unit' => 'Unit',
            'dozen' => 'Dozen',
        ];
    }

    public function isSupportedUnit(): bool
    {
        return array_key_exists($this->unit, self::getSupportedUnits());
    }
}
