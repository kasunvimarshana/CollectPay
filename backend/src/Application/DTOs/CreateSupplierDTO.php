<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Create Supplier DTO
 * 
 * Data Transfer Object for creating a supplier
 * Immutable and validated
 */
final class CreateSupplierDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $code,
        public readonly ?string $email,
        public readonly ?string $phone,
        public readonly ?string $address
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['name'] ?? '',
            $data['code'] ?? '',
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['address'] ?? null
        );
    }
}
