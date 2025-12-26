<?php

namespace App\Domain\Entities;

/**
 * User Domain Entity
 * 
 * Represents a user in the system with authentication credentials,
 * roles, and permissions for RBAC/ABAC authorization.
 * 
 * Following Clean Architecture principles, this is a pure domain entity
 * independent of framework or infrastructure concerns.
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
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;
    private ?int $version;

    public function __construct(
        string $name,
        string $email,
        string $passwordHash,
        array $roles = [],
        array $permissions = [],
        bool $isActive = true,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null,
        ?int $version = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->passwordHash = $passwordHash;
        $this->roles = $roles;
        $this->permissions = $permissions;
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

    public function getPermissions(): array
    {
        return $this->permissions;
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
    public function hasRole(string $role): bool
    {
        return in_array($role, $this->roles, true);
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions, true);
    }

    public function hasAnyRole(array $roles): bool
    {
        return !empty(array_intersect($roles, $this->roles));
    }

    public function hasAllRoles(array $roles): bool
    {
        return empty(array_diff($roles, $this->roles));
    }

    public function canPerformAction(string $action, array $context = []): bool
    {
        // ABAC: Attribute-Based Access Control
        // Check permissions based on action and context attributes
        
        if (!$this->isActive) {
            return false;
        }

        // Direct permission check
        if ($this->hasPermission($action)) {
            return true;
        }

        // Admin role has all permissions
        if ($this->hasRole('admin')) {
            return true;
        }

        // Context-based checks can be extended here
        // For example: check if user owns the resource, or belongs to same organization
        
        return false;
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

    public function addRole(string $role): void
    {
        if (!$this->hasRole($role)) {
            $this->roles[] = $role;
            $this->touch();
        }
    }

    public function removeRole(string $role): void
    {
        $this->roles = array_values(array_filter($this->roles, fn($r) => $r !== $role));
        $this->touch();
    }

    public function addPermission(string $permission): void
    {
        if (!$this->hasPermission($permission)) {
            $this->permissions[] = $permission;
            $this->touch();
        }
    }

    public function removePermission(string $permission): void
    {
        $this->permissions = array_values(array_filter($this->permissions, fn($p) => $p !== $permission));
        $this->touch();
    }

    private function touch(): void
    {
        $this->updatedAt = new \DateTime();
        $this->version = ($this->version ?? 0) + 1;
    }

    // Factory methods
    public static function create(
        string $name,
        string $email,
        string $password,
        array $roles = ['collector']
    ): self {
        return new self(
            name: $name,
            email: $email,
            passwordHash: password_hash($password, PASSWORD_BCRYPT),
            roles: $roles,
            permissions: self::getDefaultPermissionsForRoles($roles)
        );
    }

    private static function getDefaultPermissionsForRoles(array $roles): array
    {
        $permissions = [];
        
        if (in_array('admin', $roles)) {
            $permissions = [
                'users.create', 'users.read', 'users.update', 'users.delete',
                'suppliers.create', 'suppliers.read', 'suppliers.update', 'suppliers.delete',
                'products.create', 'products.read', 'products.update', 'products.delete',
                'collections.create', 'collections.read', 'collections.update', 'collections.delete',
                'payments.create', 'payments.read', 'payments.update', 'payments.delete',
            ];
        } elseif (in_array('manager', $roles)) {
            $permissions = [
                'suppliers.read', 'suppliers.update',
                'products.read', 'products.update',
                'collections.read',
                'payments.read', 'payments.create', 'payments.update',
            ];
        } elseif (in_array('collector', $roles)) {
            $permissions = [
                'suppliers.read',
                'products.read',
                'collections.create', 'collections.read', 'collections.update',
                'payments.read',
            ];
        }
        
        return $permissions;
    }
}
