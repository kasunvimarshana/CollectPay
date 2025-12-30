<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Data Transfer Object for Supplier Update
 */
final class UpdateSupplierDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $email = null,
        public readonly ?string $phone = null,
        public readonly ?string $address = null,
        public readonly ?array $metadata = null,
        public readonly ?bool $isActive = null
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            email: $data['email'] ?? null,
            phone: $data['phone'] ?? null,
            address: $data['address'] ?? null,
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
        if ($this->phone !== null) {
            $data['phone'] = $this->phone;
        }
        if ($this->address !== null) {
            $data['address'] = $this->address;
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
