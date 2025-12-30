<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Data Transfer Object for User Creation
 */
final class CreateUserDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $password,
        public readonly ?string $phone = null,
        public readonly array $roles = [],
        public readonly array $metadata = []
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? '',
            email: $data['email'] ?? '',
            password: $data['password'] ?? '',
            phone: $data['phone'] ?? null,
            roles: $data['roles'] ?? [],
            metadata: $data['metadata'] ?? []
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'password' => $this->password,
            'phone' => $this->phone,
            'roles' => $this->roles,
            'metadata' => $this->metadata,
        ];
    }
}
