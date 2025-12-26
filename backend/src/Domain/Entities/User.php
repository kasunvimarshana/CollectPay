<?php

namespace App\Domain\Entities;

/**
 * User Entity
 * 
 * Represents a system user with authentication and authorization attributes.
 * Follows Clean Architecture principles - pure business logic, no framework dependencies.
 */
class User
{
    private ?int $id;
    private string $name;
    private string $email;
    private string $passwordHash;
    private array $roles;
    private array $permissions;
    private bool $isActive;
    private int $version;
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;

    public function __construct(
        string $name,
        string $email,
        string $passwordHash,
        array $roles = ['collector'],
        array $permissions = [],
        bool $isActive = true,
        ?int $id = null,
        int $version = 1
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->passwordHash = $passwordHash;
        $this->roles = $roles;
        $this->permissions = $permissions;
        $this->isActive = $isActive;
        $this->version = $version;
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    // Getters
    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getEmail(): string { return $this->email; }
    public function getPasswordHash(): string { return $this->passwordHash; }
    public function getRoles(): array { return $this->roles; }
    public function getPermissions(): array { return $this->permissions; }
    public function isActive(): bool { return $this->isActive; }
    public function getVersion(): int { return $this->version; }
    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeInterface { return $this->updatedAt; }

    // Business logic methods
    public function hasRole(string $role): bool
    {
        return in_array($role, $this->roles);
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions);
    }

    public function canManageUsers(): bool
    {
        return $this->hasRole('admin') || $this->hasPermission('manage_users');
    }

    public function canManageRates(): bool
    {
        return $this->hasRole('admin') || $this->hasPermission('manage_rates');
    }

    public function canMakePayments(): bool
    {
        return $this->hasRole('admin') || 
               $this->hasRole('manager') || 
               $this->hasPermission('make_payments');
    }

    public function activate(): void
    {
        $this->isActive = true;
        $this->updatedAt = new \DateTime();
    }

    public function deactivate(): void
    {
        $this->isActive = false;
        $this->updatedAt = new \DateTime();
    }

    public function updateProfile(string $name, string $email): void
    {
        $this->name = $name;
        $this->email = $email;
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
            'email' => $this->email,
            'roles' => $this->roles,
            'permissions' => $this->permissions,
            'is_active' => $this->isActive,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
