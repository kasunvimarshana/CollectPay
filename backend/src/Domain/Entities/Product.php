<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Entities;

use DateTimeImmutable;

/**
 * Product Entity
 * 
 * Represents a product with versioned rate management.
 * Supports multi-unit tracking and historical rate preservation.
 */
final class Product
{
    private ?int $id;
    private string $name;
    private string $code;
    private string $unit;
    private ?string $description;
    private bool $isActive;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    public function __construct(
        string $name,
        string $code,
        string $unit,
        ?string $description = null,
        bool $isActive = true,
        ?int $id = null,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->validateName($name);
        $this->validateCode($code);
        $this->validateUnit($unit);
        
        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->unit = $unit;
        $this->description = $description;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
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

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function getDescription(): ?string
    {
        return $this->description;
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

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function update(
        string $name,
        string $unit,
        ?string $description = null
    ): void {
        $this->validateName($name);
        $this->validateUnit($unit);
        
        $this->name = $name;
        $this->unit = $unit;
        $this->description = $description;
        $this->updatedAt = new DateTimeImmutable();
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

    public function delete(): void
    {
        $this->deletedAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
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
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s')
        ];
    }

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
        
        if (!preg_match('/^[A-Z0-9-]+$/', $code)) {
            throw new \InvalidArgumentException(
                'Product code must contain only uppercase letters, numbers, and hyphens'
            );
        }
    }

    private function validateUnit(string $unit): void
    {
        $validUnits = ['kg', 'g', 'l', 'ml', 'units', 'pieces'];
        
        if (!in_array(strtolower($unit), $validUnits, true)) {
            throw new \InvalidArgumentException(
                sprintf('Invalid unit. Must be one of: %s', implode(', ', $validUnits))
            );
        }
    }
}
