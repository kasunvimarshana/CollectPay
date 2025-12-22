<?php

namespace Domain\Supplier;

use Domain\Shared\ValueObjects\Location;
use Domain\Shared\ValueObjects\Uuid;
use DateTimeImmutable;

/**
 * Supplier Entity - Domain model for suppliers
 */
final class Supplier
{
    private Uuid $id;
    private string $name;
    private string $contactNumber;
    private ?string $address;
    private ?Location $location;
    private bool $isActive;
    private Uuid $createdBy;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;

    private function __construct(
        Uuid $id,
        string $name,
        string $contactNumber,
        ?string $address,
        ?Location $location,
        Uuid $createdBy,
        bool $isActive = true
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->contactNumber = $contactNumber;
        $this->address = $address;
        $this->location = $location;
        $this->createdBy = $createdBy;
        $this->isActive = $isActive;
        $this->createdAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
    }

    public static function create(
        string $name,
        string $contactNumber,
        ?string $address,
        ?Location $location,
        Uuid $createdBy
    ): self {
        return new self(
            Uuid::generate(),
            $name,
            $contactNumber,
            $address,
            $location,
            $createdBy
        );
    }

    public static function reconstitute(
        Uuid $id,
        string $name,
        string $contactNumber,
        ?string $address,
        ?Location $location,
        Uuid $createdBy,
        bool $isActive,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt
    ): self {
        $supplier = new self($id, $name, $contactNumber, $address, $location, $createdBy, $isActive);
        $supplier->createdAt = $createdAt;
        $supplier->updatedAt = $updatedAt;
        return $supplier;
    }

    public function updateDetails(
        string $name,
        string $contactNumber,
        ?string $address,
        ?Location $location
    ): void {
        $this->name = $name;
        $this->contactNumber = $contactNumber;
        $this->address = $address;
        $this->location = $location;
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

    // Getters
    public function id(): Uuid
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function contactNumber(): string
    {
        return $this->contactNumber;
    }

    public function address(): ?string
    {
        return $this->address;
    }

    public function location(): ?Location
    {
        return $this->location;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function createdBy(): Uuid
    {
        return $this->createdBy;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
