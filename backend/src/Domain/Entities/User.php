<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\Email;
use DateTimeImmutable;

/**
 * User Entity
 * 
 * Represents a user in the system with roles and permissions.
 */
class User
{
    private function __construct(
        private string $id,
        private string $name,
        private Email $email,
        private string $passwordHash,
        private array $roles,
        private bool $isActive,
        private DateTimeImmutable $createdAt,
        private DateTimeImmutable $updatedAt
    ) {
    }

    public static function create(
        string $id,
        string $name,
        Email $email,
        string $passwordHash,
        array $roles = ['user']
    ): self {
        $now = new DateTimeImmutable();
        
        return new self(
            id: $id,
            name: $name,
            email: $email,
            passwordHash: $passwordHash,
            roles: $roles,
            isActive: true,
            createdAt: $now,
            updatedAt: $now
        );
    }

    public function id(): string
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function email(): Email
    {
        return $this->email;
    }

    public function passwordHash(): string
    {
        return $this->passwordHash;
    }

    public function roles(): array
    {
        return $this->roles;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function updateName(string $name): void
    {
        $this->name = $name;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateEmail(Email $email): void
    {
        $this->email = $email;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updatePassword(string $passwordHash): void
    {
        $this->passwordHash = $passwordHash;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function assignRoles(array $roles): void
    {
        $this->roles = $roles;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function addRole(string $role): void
    {
        if (!in_array($role, $this->roles)) {
            $this->roles[] = $role;
            $this->updatedAt = new DateTimeImmutable();
        }
    }

    public function removeRole(string $role): void
    {
        $this->roles = array_values(array_diff($this->roles, [$role]));
        $this->updatedAt = new DateTimeImmutable();
    }

    public function hasRole(string $role): bool
    {
        return in_array($role, $this->roles);
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

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => (string) $this->email,
            'roles' => $this->roles,
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
