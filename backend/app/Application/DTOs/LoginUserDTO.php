<?php

namespace App\Application\DTOs;

/**
 * Login User DTO
 * 
 * Data Transfer Object for user login.
 */
class LoginUserDTO
{
    public function __construct(
        public readonly string $email,
        public readonly string $password
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
            email: $data['email'],
            password: $data['password']
        );
    }
}
