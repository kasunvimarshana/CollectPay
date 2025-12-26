<?php

namespace App\Domain\Entities;

/**
 * User Entity
 * 
 * Represents a user in the domain.
 * This is a simple entity since authentication is primarily an infrastructure concern.
 */
class UserEntity
{
    public function __construct(
        private ?int $id,
        private string $name,
        private string $email,
        private string $password,
        private string $role = 'collector',
        private bool $isActive = true,
        private ?array $permissions = null,
        private int $version = 1
    ) {
        $this->validate();
    }

    private function validate(): void
    {
        if (empty($this->name)) {
            throw new \InvalidArgumentException('User name cannot be empty');
        }

        if (empty($this->email) || !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email address');
        }

        if (empty($this->password)) {
            throw new \InvalidArgumentException('Password cannot be empty');
        }

        $allowedRoles = ['admin', 'collector', 'finance'];
        if (!in_array($this->role, $allowedRoles)) {
            throw new \InvalidArgumentException("Invalid role. Must be one of: " . implode(', ', $allowedRoles));
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

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getPermissions(): ?array
    {
        return $this->permissions;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    public function activate(): void
    {
        $this->isActive = true;
    }

    public function deactivate(): void
    {
        $this->isActive = false;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => $this->isActive,
            'permissions' => $this->permissions,
            'version' => $this->version,
        ];
    }
}
