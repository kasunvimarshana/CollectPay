<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Data Transfer Object for User Update
 */
final class UpdateUserDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $email = null,
        public readonly ?string $password = null,
        public readonly ?string $phone = null,
        public readonly ?array $roles = null,
        public readonly ?array $metadata = null,
        public readonly ?bool $isActive = null
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            email: $data['email'] ?? null,
            password: $data['password'] ?? null,
            phone: $data['phone'] ?? null,
            roles: $data['roles'] ?? null,
            metadata: $data['metadata'] ?? null,
            isActive: isset($data['is_active']) ? (bool)$data['is_active'] : null
        );
    }

    public function toArray(): array
    {
        $data = [];
        
        if ($this->name !== null) {
            $data['name'] = $this->name;
        }
        if ($this->email !== null) {
            $data['email'] = $this->email;
        }
        if ($this->password !== null) {
            $data['password'] = $this->password;
        }
        if ($this->phone !== null) {
            $data['phone'] = $this->phone;
        }
        if ($this->roles !== null) {
            $data['roles'] = $this->roles;
        }
        if ($this->metadata !== null) {
            $data['metadata'] = $this->metadata;
        }
        if ($this->isActive !== null) {
            $data['is_active'] = $this->isActive;
        }

        return $data;
    }
}
