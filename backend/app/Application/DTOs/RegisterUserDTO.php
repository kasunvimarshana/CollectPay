<?php

namespace App\Application\DTOs;

/**
 * Register User DTO
 * 
 * Data Transfer Object for user registration.
 */
class RegisterUserDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $password,
        public readonly ?string $role = null
    ) {
    }

    /**
     * Create DTO from array
     * 
     * @param array $data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            password: $data['password'],
            role: $data['role'] ?? null
        );
    }
}
