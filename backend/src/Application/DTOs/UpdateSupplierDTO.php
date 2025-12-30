<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Update Supplier DTO
 * 
 * Data Transfer Object for updating a supplier
 */
final class UpdateSupplierDTO
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly ?string $email,
        public readonly ?string $phone,
        public readonly ?string $address
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['id'] ?? '',
            $data['name'] ?? '',
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['address'] ?? null
        );
    }
}
