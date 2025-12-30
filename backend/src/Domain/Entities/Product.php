<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\Money;
use Domain\ValueObjects\Unit;
use DateTimeImmutable;

/**
 * Product Entity
 * Represents a product with versioned rates
 */
final class Product
{
    private string $id;
    private string $name;
    private string $code;
    private ?string $description;
    private Unit $defaultUnit;
    private bool $isActive;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    private function __construct(
        string $id,
        string $name,
        string $code,
        ?string $description,
        Unit $defaultUnit,
        bool $isActive = true,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->description = $description;
        $this->defaultUnit = $defaultUnit;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
    }

    public static function create(
        string $id,
        string $name,
        string $code,
        Unit $defaultUnit,
        ?string $description = null
    ): self {
        return new self(
            $id,
            $name,
            $code,
            $description,
            $defaultUnit
        );
    }

    public static function reconstitute(
        string $id,
        string $name,
        string $code,
        ?string $description,
        Unit $defaultUnit,
        bool $isActive,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        ?DateTimeImmutable $deletedAt = null
    ): self {
        return new self(
            $id,
            $name,
            $code,
            $description,
            $defaultUnit,
            $isActive,
            $createdAt,
            $updatedAt,
            $deletedAt
        );
    }

    // Getters
    public function getId(): string
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

    public function getDefaultUnit(): Unit
    {
        return $this->defaultUnit;
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

    // Business logic
    public function updateDetails(
        string $name,
        ?string $description = null
    ): void {
        $this->name = $name;
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
        $this->isActive = false;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'default_unit' => $this->defaultUnit->toString(),
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
