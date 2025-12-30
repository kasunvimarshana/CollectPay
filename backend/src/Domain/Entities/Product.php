<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\UUID;
use Domain\ValueObjects\Money;
use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Product Domain Entity
 * 
 * Represents a product with versioned rate management
 * Immutable after creation, follows DDD principles
 */
final class Product
{
    private UUID $id;
    private string $name;
    private string $code;
    private string $unit;
    private ?string $description;
    private bool $active;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private int $version;

    private function __construct(
        UUID $id,
        string $name,
        string $code,
        string $unit,
        ?string $description,
        bool $active,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        int $version
    ) {
        $this->validateName($name);
        $this->validateCode($code);
        $this->validateUnit($unit);
        
        $this->id = $id;
        $this->name = trim($name);
        $this->code = strtoupper(trim($code));
        $this->unit = strtolower(trim($unit));
        $this->description = $description ? trim($description) : null;
        $this->active = $active;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->version = $version;
    }

    public static function create(
        string $name,
        string $code,
        string $unit,
        ?string $description = null
    ): self {
        return new self(
            UUID::generate(),
            $name,
            $code,
            $unit,
            $description,
            true,
            new DateTimeImmutable(),
            new DateTimeImmutable(),
            1
        );
    }

    public static function reconstitute(
        string $id,
        string $name,
        string $code,
        string $unit,
        ?string $description,
        bool $active,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        int $version
    ): self {
        return new self(
            UUID::fromString($id),
            $name,
            $code,
            $unit,
            $description,
            $active,
            $createdAt,
            $updatedAt,
            $version
        );
    }

    public function update(
        string $name,
        string $unit,
        ?string $description = null
    ): self {
        return new self(
            $this->id,
            $name,
            $this->code,
            $unit,
            $description,
            $this->active,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    public function activate(): self
    {
        if ($this->active) {
            return $this;
        }

        return new self(
            $this->id,
            $this->name,
            $this->code,
            $this->unit,
            $this->description,
            true,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    public function deactivate(): self
    {
        if (!$this->active) {
            return $this;
        }

        return new self(
            $this->id,
            $this->name,
            $this->code,
            $this->unit,
            $this->description,
            false,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    private function validateName(string $name): void
    {
        if (empty(trim($name))) {
            throw new InvalidArgumentException('Product name cannot be empty');
        }

        if (strlen($name) > 255) {
            throw new InvalidArgumentException('Product name cannot exceed 255 characters');
        }
    }

    private function validateCode(string $code): void
    {
        if (empty(trim($code))) {
            throw new InvalidArgumentException('Product code cannot be empty');
        }

        if (strlen($code) > 50) {
            throw new InvalidArgumentException('Product code cannot exceed 50 characters');
        }

        if (!preg_match('/^[A-Z0-9_-]+$/i', $code)) {
            throw new InvalidArgumentException('Product code can only contain letters, numbers, hyphens and underscores');
        }
    }

    private function validateUnit(string $unit): void
    {
        $unit = strtolower(trim($unit));
        $validUnits = ['kg', 'g', 'mg', 'l', 'ml'];
        
        if (!in_array($unit, $validUnits, true)) {
            throw new InvalidArgumentException('Invalid unit. Supported units: ' . implode(', ', $validUnits));
        }
    }

    // Getters
    public function id(): UUID
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function code(): string
    {
        return $this->code;
    }

    public function unit(): string
    {
        return $this->unit;
    }

    public function description(): ?string
    {
        return $this->description;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function version(): int
    {
        return $this->version;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'name' => $this->name,
            'code' => $this->code,
            'unit' => $this->unit,
            'description' => $this->description,
            'active' => $this->active,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'version' => $this->version,
        ];
    }
}
