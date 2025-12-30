<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Entities;

use DateTimeImmutable;

/**
 * User Entity
 * 
 * Represents a user in the system with role-based access control.
 * Follows Clean Architecture principles with business logic encapsulated.
 */
final class User
{
    private ?int $id;
    private string $name;
    private string $email;
    private string $passwordHash;
    private string $role;
    private bool $isActive;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    public function __construct(
        string $name,
        string $email,
        string $passwordHash,
        string $role = 'collector',
        bool $isActive = true,
        ?int $id = null,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->validateEmail($email);
        $this->validateRole($role);
        
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->passwordHash = $passwordHash;
        $this->role = $role;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
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

    public function getRole(): string
    {
        return $this->role;
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

    public function updateName(string $name): void
    {
        $this->name = $name;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateEmail(string $email): void
    {
        $this->validateEmail($email);
        $this->email = $email;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateRole(string $role): void
    {
        $this->validateRole($role);
        $this->role = $role;
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
        $this->updatedAt = new DateTimeImmutable();
    }

    public function verifyPassword(string $password): bool
    {
        return password_verify($password, $this->passwordHash);
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function hasPermission(string $permission): bool
    {
        // RBAC implementation - define permissions per role
        $rolePermissions = [
            'admin' => ['*'], // All permissions
            'manager' => [
                'view_reports', 'manage_suppliers', 'manage_products',
                'manage_collections', 'manage_payments', 'view_audit_logs'
            ],
            'collector' => [
                'view_suppliers', 'create_collections', 'view_collections',
                'create_payments', 'view_payments'
            ],
            'viewer' => ['view_reports', 'view_collections', 'view_payments']
        ];

        $permissions = $rolePermissions[$this->role] ?? [];
        
        return in_array('*', $permissions, true) || in_array($permission, $permissions, true);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s')
        ];
    }

    private function validateEmail(string $email): void
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
        }
    }

    private function validateRole(string $role): void
    {
        $validRoles = ['admin', 'manager', 'collector', 'viewer'];
        
        if (!in_array($role, $validRoles, true)) {
            throw new \InvalidArgumentException(
                sprintf('Invalid role. Must be one of: %s', implode(', ', $validRoles))
            );
        }
    }
}
