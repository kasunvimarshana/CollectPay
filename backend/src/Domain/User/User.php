<?php

namespace Domain\User;

use Domain\Shared\ValueObjects\Email;
use Domain\Shared\ValueObjects\Uuid;
use DateTimeImmutable;

/**
 * User Entity - Core domain model
 * Implements SOLID principles with encapsulated business logic
 */
final class User
{
    private Uuid $id;
    private string $name;
    private Email $email;
    private string $passwordHash;
    private UserRole $role;
    private bool $isActive;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $lastLoginAt;

    private function __construct(
        Uuid $id,
        string $name,
        Email $email,
        string $passwordHash,
        UserRole $role,
        bool $isActive = true
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->passwordHash = $passwordHash;
        $this->role = $role;
        $this->isActive = $isActive;
        $this->createdAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
        $this->lastLoginAt = null;
    }

    public static function create(
        string $name,
        Email $email,
        string $passwordHash,
        UserRole $role
    ): self {
        return new self(
            Uuid::generate(),
            $name,
            $email,
            $passwordHash,
            $role
        );
    }

    public static function reconstitute(
        Uuid $id,
        string $name,
        Email $email,
        string $passwordHash,
        UserRole $role,
        bool $isActive,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        ?DateTimeImmutable $lastLoginAt
    ): self {
        $user = new self($id, $name, $email, $passwordHash, $role, $isActive);
        $user->createdAt = $createdAt;
        $user->updatedAt = $updatedAt;
        $user->lastLoginAt = $lastLoginAt;
        return $user;
    }

    public function updateProfile(string $name): void
    {
        $this->name = $name;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function changePassword(string $newPasswordHash): void
    {
        $this->passwordHash = $newPasswordHash;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function changeRole(UserRole $role): void
    {
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

    public function recordLogin(): void
    {
        $this->lastLoginAt = new DateTimeImmutable();
    }

    public function hasPermission(string $permission): bool
    {
        return $this->role->hasPermission($permission);
    }

    // Getters
    public function id(): Uuid
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

    public function role(): UserRole
    {
        return $this->role;
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

    public function lastLoginAt(): ?DateTimeImmutable
    {
        return $this->lastLoginAt;
    }
}
