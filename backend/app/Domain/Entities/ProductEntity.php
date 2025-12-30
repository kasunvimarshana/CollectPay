<?php

namespace App\Domain\Entities;

/**
 * Product Domain Entity
 *
 * Represents the core business concept of a Product.
 * This is a pure domain object with business logic and no framework dependencies.
 */
class ProductEntity
{
    private ?int $id;

    private string $name;

    private string $code;

    private ?string $description;

    private string $baseUnit;

    private array $allowedUnits;

    private string $status;

    private array $metadata;

    private int $version;

    private ?\DateTimeInterface $createdAt;

    private ?\DateTimeInterface $updatedAt;

    public function __construct(
        string $name,
        string $code,
        string $baseUnit,
        ?string $description = null,
        array $allowedUnits = [],
        string $status = 'active',
        array $metadata = [],
        int $version = 1,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null
    ) {
        $this->validateName($name);
        $this->validateCode($code);
        $this->validateStatus($status);
        $this->validateUnit($baseUnit);

        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->description = $description;
        $this->baseUnit = $baseUnit;
        $this->allowedUnits = empty($allowedUnits) ? [$baseUnit] : $allowedUnits;
        $this->status = $status;
        $this->metadata = $metadata;
        $this->version = $version;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
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

    public function getBaseUnit(): string
    {
        return $this->baseUnit;
    }

    public function getAllowedUnits(): array
    {
        return $this->allowedUnits;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    // Business methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function activate(): void
    {
        $this->status = 'active';
        $this->incrementVersion();
    }

    public function deactivate(): void
    {
        $this->status = 'inactive';
        $this->incrementVersion();
    }

    public function isUnitAllowed(string $unit): bool
    {
        return in_array($unit, $this->allowedUnits);
    }

    public function addAllowedUnit(string $unit): void
    {
        $this->validateUnit($unit);

        if (! in_array($unit, $this->allowedUnits)) {
            $this->allowedUnits[] = $unit;
            $this->incrementVersion();
        }
    }

    public function updateDetails(
        ?string $name = null,
        ?string $description = null
    ): void {
        if ($name !== null) {
            $this->validateName($name);
            $this->name = $name;
        }
        if ($description !== null) {
            $this->description = $description;
        }

        $this->incrementVersion();
    }

    public function updateMetadata(array $metadata): void
    {
        $this->metadata = array_merge($this->metadata, $metadata);
        $this->incrementVersion();
    }

    public function incrementVersion(): void
    {
        $this->version++;
    }

    // Validation methods (business rules)
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

        if (strlen($code) > 50) {
            throw new \InvalidArgumentException('Product code cannot exceed 50 characters');
        }
    }

    private function validateStatus(string $status): void
    {
        $validStatuses = ['active', 'inactive'];
        if (! in_array($status, $validStatuses)) {
            throw new \InvalidArgumentException('Invalid status. Must be one of: '.implode(', ', $validStatuses));
        }
    }

    private function validateUnit(string $unit): void
    {
        $validUnits = ['kg', 'g', 'l', 'ml', 'unit', 'lb', 'oz', 't'];
        if (! in_array($unit, $validUnits)) {
            throw new \InvalidArgumentException('Invalid unit. Must be one of: '.implode(', ', $validUnits));
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'base_unit' => $this->baseUnit,
            'allowed_units' => $this->allowedUnits,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'version' => $this->version,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
