<?php

namespace App\Domain\Entities;

/**
 * Supplier Domain Entity
 * 
 * Represents a supplier in the system with detailed profile information.
 * Suppliers are the entities from whom collections are made.
 * 
 * Following Clean Architecture principles - pure domain entity.
 */
class Supplier
{
    private ?int $id;
    private string $name;
    private string $code;
    private ?string $contactPerson;
    private ?string $phone;
    private ?string $email;
    private ?string $address;
    private ?string $notes;
    private bool $isActive;
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;
    private ?int $version;

    public function __construct(
        string $name,
        string $code,
        ?string $contactPerson = null,
        ?string $phone = null,
        ?string $email = null,
        ?string $address = null,
        ?string $notes = null,
        bool $isActive = true,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null,
        ?int $version = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->contactPerson = $contactPerson;
        $this->phone = $phone;
        $this->email = $email;
        $this->address = $address;
        $this->notes = $notes;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new \DateTime();
        $this->updatedAt = $updatedAt ?? new \DateTime();
        $this->version = $version ?? 0;
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

    public function getContactPerson(): ?string
    {
        return $this->contactPerson;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function getVersion(): ?int
    {
        return $this->version;
    }

    // Business logic methods
    public function updateDetails(
        ?string $name = null,
        ?string $contactPerson = null,
        ?string $phone = null,
        ?string $email = null,
        ?string $address = null,
        ?string $notes = null
    ): void {
        if ($name !== null) {
            $this->name = $name;
        }
        if ($contactPerson !== null) {
            $this->contactPerson = $contactPerson;
        }
        if ($phone !== null) {
            $this->phone = $phone;
        }
        if ($email !== null) {
            $this->email = $email;
        }
        if ($address !== null) {
            $this->address = $address;
        }
        if ($notes !== null) {
            $this->notes = $notes;
        }
        
        $this->touch();
    }

    public function activate(): void
    {
        $this->isActive = true;
        $this->touch();
    }

    public function deactivate(): void
    {
        $this->isActive = false;
        $this->touch();
    }

    private function touch(): void
    {
        $this->updatedAt = new \DateTime();
        $this->version = ($this->version ?? 0) + 1;
    }

    // Factory method
    public static function create(
        string $name,
        string $code,
        ?string $contactPerson = null,
        ?string $phone = null,
        ?string $email = null,
        ?string $address = null
    ): self {
        return new self(
            name: $name,
            code: $code,
            contactPerson: $contactPerson,
            phone: $phone,
            email: $email,
            address: $address
        );
    }

    // Validation
    public function validate(): array
    {
        $errors = [];

        if (empty(trim($this->name))) {
            $errors[] = 'Supplier name is required';
        }

        if (empty(trim($this->code))) {
            $errors[] = 'Supplier code is required';
        }

        if ($this->email && !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Invalid email format';
        }

        return $errors;
    }

    public function isValid(): bool
    {
        return empty($this->validate());
    }
}
