<?php

namespace Domain\User;

use InvalidArgumentException;

/**
 * UserRole Value Object - Encapsulates role and permissions logic
 */
final class UserRole
{
    private string $name;
    private array $permissions;

    private const ROLES = [
        'admin' => ['*'],
        'manager' => [
            'users.view', 'users.create', 'users.update',
            'suppliers.view', 'suppliers.create', 'suppliers.update', 'suppliers.delete',
            'collections.view', 'collections.create', 'collections.update', 'collections.delete',
            'payments.view', 'payments.create', 'payments.update', 'payments.delete',
            'reports.view',
        ],
        'collector' => [
            'suppliers.view', 'suppliers.create',
            'collections.view', 'collections.create', 'collections.update.own',
            'payments.view', 'payments.create',
        ],
        'viewer' => [
            'suppliers.view',
            'collections.view',
            'payments.view',
        ],
    ];

    private function __construct(string $name)
    {
        $this->ensureIsValid($name);
        $this->name = $name;
        $this->permissions = self::ROLES[$name];
    }

    public static function fromString(string $name): self
    {
        return new self($name);
    }

    public function name(): string
    {
        return $this->name;
    }

    public function permissions(): array
    {
        return $this->permissions;
    }

    public function hasPermission(string $permission): bool
    {
        // Admin has all permissions
        if (in_array('*', $this->permissions)) {
            return true;
        }

        return in_array($permission, $this->permissions);
    }

    public function equals(UserRole $other): bool
    {
        return $this->name === $other->name;
    }

    public function __toString(): string
    {
        return $this->name;
    }

    private function ensureIsValid(string $name): void
    {
        if (!array_key_exists($name, self::ROLES)) {
            throw new InvalidArgumentException("Invalid role: {$name}");
        }
    }
}
