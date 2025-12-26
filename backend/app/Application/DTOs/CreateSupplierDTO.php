<?php

namespace App\Application\DTOs;

/**
 * Create Supplier DTO
 * 
 * Data Transfer Object for creating a new supplier.
 * Decouples application layer from HTTP layer.
 */
class CreateSupplierDTO
{
    public string $name;
    public string $code;
    public ?string $address;
    public ?string $phone;
    public ?string $email;
    public ?array $metadata;
    public bool $isActive;

    public function __construct(
        string $name,
        string $code,
        ?string $address = null,
        ?string $phone = null,
        ?string $email = null,
        ?array $metadata = null,
        bool $isActive = true
    ) {
        $this->name = $name;
        $this->code = $code;
        $this->address = $address;
        $this->phone = $phone;
        $this->email = $email;
        $this->metadata = $metadata;
        $this->isActive = $isActive;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            code: $data['code'],
            address: $data['address'] ?? null,
            phone: $data['phone'] ?? null,
            email: $data['email'] ?? null,
            metadata: $data['metadata'] ?? null,
            isActive: $data['is_active'] ?? true
        );
    }
}
