<?php

namespace App\Domain\Entities;

use DateTime;

/**
 * Supplier Entity
 * 
 * Represents a supplier in the domain model with detailed profile information.
 */
class Supplier
{
    private ?int $id;
    private string $name;
    private string $code;
    private ?string $address;
    private ?string $phone;
    private ?string $email;
    private ?string $contactPerson;
    private bool $isActive;
    private DateTime $createdAt;
    private DateTime $updatedAt;
    private ?int $createdBy;

    public function __construct(
        string $name,
        string $code,
        ?string $address = null,
        ?string $phone = null,
        ?string $email = null,
        ?string $contactPerson = null,
        bool $isActive = true,
        ?int $id = null,
        ?DateTime $createdAt = null,
        ?DateTime $updatedAt = null,
        ?int $createdBy = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->address = $address;
        $this->phone = $phone;
        $this->email = $email;
        $this->contactPerson = $contactPerson;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new DateTime();
        $this->updatedAt = $updatedAt ?? new DateTime();
        $this->createdBy = $createdBy;
        
        $this->validate();
    }

    private function validate(): void
    {
        if (empty($this->name)) {
            throw new \InvalidArgumentException('Supplier name cannot be empty');
        }
        
        if (empty($this->code)) {
            throw new \InvalidArgumentException('Supplier code cannot be empty');
        }
        
        if ($this->email !== null && !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
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

    public function getContactPerson(): ?string
    {
        return $this->contactPerson;
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
        ?string $address = null,
        ?string $phone = null,
        ?string $email = null,
        ?string $contactPerson = null
    ): void {
        if (empty($name)) {
            throw new \InvalidArgumentException('Supplier name cannot be empty');
        }
        
        if ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
        }
        
        $this->name = $name;
        $this->address = $address;
        $this->phone = $phone;
        $this->email = $email;
        $this->contactPerson = $contactPerson;
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
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'contact_person' => $this->contactPerson,
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'created_by' => $this->createdBy,
        ];
    }
}
