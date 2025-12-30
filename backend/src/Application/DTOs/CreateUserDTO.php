<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Create User DTO
 */
final class CreateUserDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $password,
        public readonly array $roles = ['user']
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            $data['name'],
            $data['email'],
            $data['password'],
            $data['roles'] ?? ['user']
        );
    }
}
