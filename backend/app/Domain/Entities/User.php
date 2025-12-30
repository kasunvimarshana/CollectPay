<?php

namespace App\Domain\Entities;

use DateTime;

/**
 * User Entity
 * 
 * Represents a user in the domain model.
 * Follows Clean Architecture principles - pure domain logic with no framework dependencies.
 */
class User
{
    private ?int $id;
    private string $name;
    private string $email;
    private string $passwordHash;
    private array $roles;
    private bool $isActive;
    private DateTime $createdAt;
    private DateTime $updatedAt;

    public function __construct(
        string $name,
        string $email,
        string $passwordHash,
        array $roles = ['user'],
        bool $isActive = true,
        ?int $id = null,
        ?DateTime $createdAt = null,
        ?DateTime $updatedAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->passwordHash = $passwordHash;
        $this->roles = $roles;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new DateTime();
        $this->updatedAt = $updatedAt ?? new DateTime();
        
        $this->validate();
    }

    private function validate(): void
    {
        if (empty($this->name)) {
            throw new \InvalidArgumentException('User name cannot be empty');
        }
        
        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
        }
        
        if (empty($this->passwordHash)) {
            throw new \InvalidArgumentException('Password hash cannot be empty');
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

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPasswordHash(): string
    {
        return $this->passwordHash;
    }

    public function getRoles(): array
    {
        return $this->roles;
    }

    public function hasRole(string $role): bool
    {
        return in_array($role, $this->roles);
    }

    public function isActive(): bool
    {
        return $this->isActive;
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

    public function updateName(string $name): void
    {
        if (empty($name)) {
            throw new \InvalidArgumentException('User name cannot be empty');
        }
        
        $this->name = $name;
        $this->updatedAt = new DateTime();
    }

    public function updateEmail(string $email): void
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
        }
        
        $this->email = $email;
        $this->updatedAt = new DateTime();
    }

    public function updatePassword(string $passwordHash): void
    {
        if (empty($passwordHash)) {
            throw new \InvalidArgumentException('Password hash cannot be empty');
        }
        
        $this->passwordHash = $passwordHash;
        $this->updatedAt = new DateTime();
    }

    public function assignRoles(array $roles): void
    {
        $this->roles = $roles;
        $this->updatedAt = new DateTime();
    }

    public function getCreatedAt(): DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTime
    {
        return $this->updatedAt;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->roles,
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
