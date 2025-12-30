<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\Email;
use Domain\ValueObjects\PhoneNumber;
use DateTimeImmutable;

/**
 * Supplier Entity
 * 
 * Represents a supplier from whom collections are made.
 */
class Supplier
{
    private function __construct(
        private string $id,
        private string $name,
        private ?Email $email,
        private ?PhoneNumber $phone,
        private ?string $address,
        private array $metadata,
        private bool $isActive,
        private DateTimeImmutable $createdAt,
        private DateTimeImmutable $updatedAt
    ) {
    }

    public static function create(
        string $id,
        string $name,
        ?Email $email = null,
        ?PhoneNumber $phone = null,
        ?string $address = null,
        array $metadata = []
    ): self {
        $now = new DateTimeImmutable();
        
        return new self(
            id: $id,
            name: $name,
            email: $email,
            phone: $phone,
            address: $address,
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

    public function email(): ?Email
    {
        return $this->email;
    }

    public function phone(): ?PhoneNumber
    {
        return $this->phone;
    }

    public function address(): ?string
    {
        return $this->address;
    }

    public function metadata(): array
    {
        return $this->metadata;
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

    public function updateEmail(?Email $email): void
    {
        $this->email = $email;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updatePhone(?PhoneNumber $phone): void
    {
        $this->phone = $phone;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateAddress(?string $address): void
    {
        $this->address = $address;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateMetadata(array $metadata): void
    {
        $this->metadata = $metadata;
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

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email ? (string) $this->email : null,
            'phone' => $this->phone ? (string) $this->phone : null,
            'address' => $this->address,
            'metadata' => $this->metadata,
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
