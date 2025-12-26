<?php

namespace App\Application\DTOs;

/**
 * Update Supplier DTO
 * 
 * Data Transfer Object for updating an existing supplier.
 */
class UpdateSupplierDTO
{
    public int $id;
    public ?string $name;
    public ?string $code;
    public ?string $address;
    public ?string $phone;
    public ?string $email;
    public ?array $metadata;
    public ?bool $isActive;
    public int $version;

    public function __construct(
        int $id,
        int $version,
        ?string $name = null,
        ?string $code = null,
        ?string $address = null,
        ?string $phone = null,
        ?string $email = null,
        ?array $metadata = null,
        ?bool $isActive = null
    ) {
        $this->id = $id;
        $this->version = $version;
        $this->name = $name;
        $this->code = $code;
        $this->address = $address;
        $this->phone = $phone;
        $this->email = $email;
        $this->metadata = $metadata;
        $this->isActive = $isActive;
    }

    public static function fromArray(int $id, array $data): self
    {
        return new self(
            id: $id,
            version: $data['version'],
            name: $data['name'] ?? null,
            code: $data['code'] ?? null,
            address: $data['address'] ?? null,
            phone: $data['phone'] ?? null,
            email: $data['email'] ?? null,
            metadata: $data['metadata'] ?? null,
            isActive: $data['is_active'] ?? null
        );
    }
}
