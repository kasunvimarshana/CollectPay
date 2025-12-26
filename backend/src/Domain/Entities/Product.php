<?php

namespace App\Domain\Entities;

/**
 * Product Entity
 * 
 * Represents a product/item that can be collected from suppliers.
 * Supports multiple units (kg, g, items, etc.)
 */
class Product
{
    private ?int $id;
    private string $name;
    private string $code; // Unique identifier
    private string $unit; // kg, g, lbs, items, etc.
    private ?string $description;
    private bool $isActive;
    private int $version;
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;

    public function __construct(
        string $name,
        string $code,
        string $unit = 'kg',
        ?string $description = null,
        bool $isActive = true,
        ?int $id = null,
        int $version = 1
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->unit = $unit;
        $this->description = $description;
        $this->isActive = $isActive;
        $this->version = $version;
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    // Getters
    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getCode(): string { return $this->code; }
    public function getUnit(): string { return $this->unit; }
    public function getDescription(): ?string { return $this->description; }
    public function isActive(): bool { return $this->isActive; }
    public function getVersion(): int { return $this->version; }
    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeInterface { return $this->updatedAt; }

    // Business logic methods
    public function update(
        string $name,
        string $unit,
        ?string $description = null
    ): void {
        $this->name = $name;
        $this->unit = $unit;
        $this->description = $description;
        $this->version++;
        $this->updatedAt = new \DateTime();
    }

    public function activate(): void
    {
        $this->isActive = true;
        $this->version++;
        $this->updatedAt = new \DateTime();
    }

    public function deactivate(): void
    {
        $this->isActive = false;
        $this->version++;
        $this->updatedAt = new \DateTime();
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function incrementVersion(): void
    {
        $this->version++;
        $this->updatedAt = new \DateTime();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'unit' => $this->unit,
            'description' => $this->description,
            'is_active' => $this->isActive,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
