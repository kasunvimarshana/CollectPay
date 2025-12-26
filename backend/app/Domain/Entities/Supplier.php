<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

/**
 * Supplier Entity
 * Represents a supplier from whom products are collected
 */
class Supplier
{
    private string $id;
    private string $name;
    private string $code; // Unique supplier code
    private ?string $address;
    private ?string $phone;
    private ?string $email;
    private ?string $notes;
    private string $userId; // Creator/Owner
    private int $version;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    public function __construct(
        string $id,
        string $name,
        string $code,
        string $userId,
        ?string $address = null,
        ?string $phone = null,
        ?string $email = null,
        ?string $notes = null,
        int $version = 1,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->userId = $userId;
        $this->address = $address;
        $this->phone = $phone;
        $this->email = $email;
        $this->notes = $notes;
        $this->version = $version;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
    }

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

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getVersion(): int
    {
        return $this->version;
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

    public function incrementVersion(): void
    {
        $this->version++;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'user_id' => $this->userId,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'notes' => $this->notes,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
