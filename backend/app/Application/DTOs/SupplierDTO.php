<?php

namespace App\Application\DTOs;

/**
 * Supplier Data Transfer Object
 *
 * Used to transfer supplier data between layers.
 * Implements immutability and validation at the application layer.
 */
class SupplierDTO
{
    public readonly string $name;

    public readonly string $code;

    public readonly ?string $contactPerson;

    public readonly ?string $phone;

    public readonly ?string $email;

    public readonly ?string $address;

    public readonly ?string $city;

    public readonly ?string $state;

    public readonly ?string $country;

    public readonly ?string $postalCode;

    public readonly string $status;

    public readonly ?int $id;

    public readonly int $version;

    public function __construct(
        string $name,
        string $code,
        ?string $contactPerson = null,
        ?string $phone = null,
        ?string $email = null,
        ?string $address = null,
        ?string $city = null,
        ?string $state = null,
        ?string $country = null,
        ?string $postalCode = null,
        string $status = 'active',
        ?int $id = null,
        int $version = 1
    ) {
        $this->name = $name;
        $this->code = $code;
        $this->contactPerson = $contactPerson;
        $this->phone = $phone;
        $this->email = $email;
        $this->address = $address;
        $this->city = $city;
        $this->state = $state;
        $this->country = $country;
        $this->postalCode = $postalCode;
        $this->status = $status;
        $this->id = $id;
        $this->version = $version;
    }

    /**
     * Create DTO from array (e.g., from HTTP request)
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            code: $data['code'] ?? '',
            contactPerson: $data['contact_person'] ?? null,
            phone: $data['phone'] ?? null,
            email: $data['email'] ?? null,
            address: $data['address'] ?? null,
            city: $data['city'] ?? null,
            state: $data['state'] ?? null,
            country: $data['country'] ?? null,
            postalCode: $data['postal_code'] ?? null,
            status: $data['status'] ?? 'active',
            id: $data['id'] ?? null,
            version: $data['version'] ?? 1
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'contact_person' => $this->contactPerson,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'country' => $this->country,
            'postal_code' => $this->postalCode,
            'status' => $this->status,
            'version' => $this->version,
        ];
    }
}
