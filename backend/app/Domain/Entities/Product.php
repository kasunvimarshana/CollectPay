<?php

namespace App\Domain\Entities;

use App\Domain\ValueObjects\Money;
use DateTime;

/**
 * Product Entity
 * 
 * Represents a product with support for time-based and versioned rates.
 */
class Product
{
    private ?int $id;
    private string $name;
    private string $code;
    private ?string $description;
    private string $unit;
    private bool $isActive;
    private DateTime $createdAt;
    private DateTime $updatedAt;
    private ?int $createdBy;

    public function __construct(
        string $name,
        string $code,
        string $unit,
        ?string $description = null,
        bool $isActive = true,
        ?int $id = null,
        ?DateTime $createdAt = null,
        ?DateTime $updatedAt = null,
        ?int $createdBy = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->description = $description;
        $this->unit = $unit;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new DateTime();
        $this->updatedAt = $updatedAt ?? new DateTime();
        $this->createdBy = $createdBy;
        
        $this->validate();
    }

    private function validate(): void
    {
        if (empty($this->name)) {
            throw new \InvalidArgumentException('Product name cannot be empty');
        }
        
        if (empty($this->code)) {
            throw new \InvalidArgumentException('Product code cannot be empty');
        }
        
        if (empty($this->unit)) {
            throw new \InvalidArgumentException('Product unit cannot be empty');
        }
    }

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

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getCreatedAt(): DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTime
    {
        return $this->updatedAt;
    }

    public function getCreatedBy(): ?int
    {
        return $this->createdBy;
    }

    public function updateDetails(
        string $name,
        ?string $description = null
    ): void {
        if (empty($name)) {
            throw new \InvalidArgumentException('Product name cannot be empty');
        }
        
        $this->name = $name;
        $this->description = $description;
        $this->updatedAt = new DateTime();
    }

    public function activate(): void
    {
        $this->isActive = true;
        $this->updatedAt = new DateTime();
    }

    public function deactivate(): void
    {
        $this->isActive = false;
        $this->updatedAt = new DateTime();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'unit' => $this->unit,
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'created_by' => $this->createdBy,
        ];
    }
}
