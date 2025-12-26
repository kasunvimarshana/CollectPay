<?php

namespace App\Domain\Entities;

/**
 * Supplier Entity
 * 
 * Represents a supplier/vendor from whom products are collected.
 * Contains profile information and business relationships.
 */
class Supplier
{
    private ?int $id;
    private string $name;
    private string $code; // Unique identifier
    private ?string $phone;
    private ?string $address;
    private ?string $region;
    private ?string $notes;
    private bool $isActive;
    private int $version;
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;

    public function __construct(
        string $name,
        string $code,
        ?string $phone = null,
        ?string $address = null,
        ?string $region = null,
        ?string $notes = null,
        bool $isActive = true,
        ?int $id = null,
        int $version = 1
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->phone = $phone;
        $this->address = $address;
        $this->region = $region;
        $this->notes = $notes;
        $this->isActive = $isActive;
        $this->version = $version;
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    // Getters
    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getCode(): string { return $this->code; }
    public function getPhone(): ?string { return $this->phone; }
    public function getAddress(): ?string { return $this->address; }
    public function getRegion(): ?string { return $this->region; }
    public function getNotes(): ?string { return $this->notes; }
    public function isActive(): bool { return $this->isActive; }
    public function getVersion(): int { return $this->version; }
    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeInterface { return $this->updatedAt; }

    // Business logic methods
    public function update(
        string $name,
        ?string $phone = null,
        ?string $address = null,
        ?string $region = null,
        ?string $notes = null
    ): void {
        $this->name = $name;
        $this->phone = $phone;
        $this->address = $address;
        $this->region = $region;
        $this->notes = $notes;
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
            'phone' => $this->phone,
            'address' => $this->address,
            'region' => $this->region,
            'notes' => $this->notes,
            'is_active' => $this->isActive,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
