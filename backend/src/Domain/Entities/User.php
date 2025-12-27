<?php

declare(strict_types=1);

namespace TrackVault\Domain\Entities;

use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Email;
use DateTimeImmutable;

/**
 * User Entity
 * 
 * Represents a user in the system with RBAC capabilities
 */
final class User
{
    private UserId $id;
    private string $name;
    private Email $email;
    private string $passwordHash;
    private array $roles;
    private array $permissions;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;
    private int $version;

    public function __construct(
        UserId $id,
        string $name,
        Email $email,
        string $passwordHash,
        array $roles = [],
        array $permissions = [],
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null,
        int $version = 1
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->passwordHash = $passwordHash;
        $this->roles = $roles;
        $this->permissions = $permissions;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
        $this->version = $version;
    }

    public function getId(): UserId
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getEmail(): Email
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

    public function hasRole(string $role): bool
    {
        return in_array($role, $this->roles, true);
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions, true);
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

    public function getVersion(): int
    {
        return $this->version;
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }

    public function updateName(string $name): self
    {
        return new self(
            $this->id,
            $name,
            $this->email,
            $this->passwordHash,
            $this->roles,
            $this->permissions,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->deletedAt,
            $this->version + 1
        );
    }

    public function updateEmail(Email $email): self
    {
        return new self(
            $this->id,
            $this->name,
            $email,
            $this->passwordHash,
            $this->roles,
            $this->permissions,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->deletedAt,
            $this->version + 1
        );
    }

    public function updatePassword(string $passwordHash): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->email,
            $passwordHash,
            $this->roles,
            $this->permissions,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->deletedAt,
            $this->version + 1
        );
    }

    public function assignRoles(array $roles): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->email,
            $this->passwordHash,
            $roles,
            $this->permissions,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->deletedAt,
            $this->version + 1
        );
    }

    public function grantPermissions(array $permissions): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->email,
            $this->passwordHash,
            $this->roles,
            $permissions,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->deletedAt,
            $this->version + 1
        );
    }

    public function delete(): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->email,
            $this->passwordHash,
            $this->roles,
            $this->permissions,
            $this->createdAt,
            new DateTimeImmutable(),
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->toString(),
            'name' => $this->name,
            'email' => $this->email->toString(),
            'roles' => $this->roles,
            'permissions' => $this->permissions,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
            'version' => $this->version,
        ];
    }
}
