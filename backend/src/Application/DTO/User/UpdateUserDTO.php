<?php

namespace Application\DTO\User;

class UpdateUserDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $role = null,
        public readonly ?string $password = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            $data['name'] ?? null,
            $data['role'] ?? null,
            $data['password'] ?? null
        );
    }
}
