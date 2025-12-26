<?php

namespace App\Domain\Entities;

use DateTimeImmutable;

/**
 * User Entity
 * Represents a system user with authentication and role information
 */
class User
{
    private string $id;
    private string $name;
    private string $email;
    private string $passwordHash;
    private string $role; // admin, collector, viewer
    private array $permissions;
    private int $version;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    public function __construct(
        string $id,
        string $name,
        string $email,
        string $passwordHash,
        string $role,
        array $permissions = [],
        int $version = 1,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->passwordHash = $passwordHash;
        $this->role = $role;
        $this->permissions = $permissions;
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

    public function getPermissions(): array
    {
        return $this->permissions;
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

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions, true);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
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
            'email' => $this->email,
            'role' => $this->role,
            'permissions' => $this->permissions,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
