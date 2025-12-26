<?php

namespace App\Domain\Entities;

/**
 * Product Domain Entity
 * 
 * Represents a product in the system.
 * Contains business logic for product management and unit support.
 */
class ProductEntity
{
    private ?int $id;
    private string $name;
    private string $code;
    private ?string $description;
    private string $defaultUnit;
    private array $supportedUnits;
    private ?array $metadata;
    private bool $isActive;
    private int $version;

    public function __construct(
        string $name,
        string $code,
        string $defaultUnit,
        array $supportedUnits = [],
        ?string $description = null,
        ?array $metadata = null,
        bool $isActive = true,
        int $version = 1,
        ?int $id = null
    ) {
        $this->validateName($name);
        $this->validateCode($code);
        $this->validateUnit($defaultUnit);
        
        // Ensure default unit is in supported units
        if (empty($supportedUnits)) {
            $supportedUnits = [$defaultUnit];
        } elseif (!in_array($defaultUnit, $supportedUnits)) {
            $supportedUnits[] = $defaultUnit;
        }

        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->description = $description;
        $this->defaultUnit = $defaultUnit;
        $this->supportedUnits = array_unique($supportedUnits);
        $this->metadata = $metadata;
        $this->isActive = $isActive;
        $this->version = $version;
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

    public function getDefaultUnit(): string
    {
        return $this->defaultUnit;
    }

    public function getSupportedUnits(): array
    {
        return $this->supportedUnits;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    // Business methods
    public function updateDetails(
        ?string $name = null,
        ?string $description = null,
        ?array $metadata = null
    ): void {
        if ($name !== null) {
            $this->validateName($name);
            $this->name = $name;
        }

        $this->description = $description ?? $this->description;
        $this->metadata = $metadata ?? $this->metadata;
    }

    public function addSupportedUnit(string $unit): void
    {
        $this->validateUnit($unit);
        
        if (!in_array($unit, $this->supportedUnits)) {
            $this->supportedUnits[] = $unit;
        }
    }

    public function removeSupportedUnit(string $unit): void
    {
        // Cannot remove default unit
        if ($unit === $this->defaultUnit) {
            throw new \InvalidArgumentException('Cannot remove default unit');
        }

        $this->supportedUnits = array_values(
            array_filter($this->supportedUnits, fn($u) => $u !== $unit)
        );
    }

    public function changeDefaultUnit(string $newDefaultUnit): void
    {
        $this->validateUnit($newDefaultUnit);

        if (!$this->supportsUnit($newDefaultUnit)) {
            throw new \InvalidArgumentException(
                "Unit '{$newDefaultUnit}' is not in supported units"
            );
        }

        $this->defaultUnit = $newDefaultUnit;
    }

    public function supportsUnit(string $unit): bool
    {
        return in_array($unit, $this->supportedUnits);
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

    // Validation methods
    private function validateName(string $name): void
    {
        if (empty(trim($name))) {
            throw new \InvalidArgumentException('Product name cannot be empty');
        }

        if (strlen($name) > 255) {
            throw new \InvalidArgumentException('Product name cannot exceed 255 characters');
        }
    }

    private function validateCode(string $code): void
    {
        if (empty(trim($code))) {
            throw new \InvalidArgumentException('Product code cannot be empty');
        }

        if (strlen($code) > 255) {
            throw new \InvalidArgumentException('Product code cannot exceed 255 characters');
        }
    }

    private function validateUnit(string $unit): void
    {
        if (empty(trim($unit))) {
            throw new \InvalidArgumentException('Unit cannot be empty');
        }

        if (strlen($unit) > 50) {
            throw new \InvalidArgumentException('Unit cannot exceed 50 characters');
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'default_unit' => $this->defaultUnit,
            'supported_units' => $this->supportedUnits,
            'metadata' => $this->metadata,
            'is_active' => $this->isActive,
            'version' => $this->version,
        ];
    }
}
