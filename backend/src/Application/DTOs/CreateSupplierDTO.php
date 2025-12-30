<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Create Supplier DTO
 */
final class CreateSupplierDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $code,
        public readonly ?string $address = null,
        public readonly ?string $phone = null,
        public readonly ?string $email = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            $data['name'],
            $data['code'],
            $data['address'] ?? null,
            $data['phone'] ?? null,
            $data['email'] ?? null
        );
    }
}
