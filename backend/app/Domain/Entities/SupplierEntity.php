<?php

namespace App\Domain\Entities;

/**
 * Supplier Domain Entity
 *
 * Represents the core business concept of a Supplier.
 * This is a pure domain object with business logic and no framework dependencies.
 */
class SupplierEntity
{
    private ?int $id;

    private string $name;

    private string $code;

    private ?string $contactPerson;

    private ?string $phone;

    private ?string $email;

    private ?string $address;

    private ?string $city;

    private ?string $state;

    private ?string $country;

    private ?string $postalCode;

    private string $status;

    private int $version;

    private ?\DateTimeInterface $createdAt;

    private ?\DateTimeInterface $updatedAt;

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
        int $version = 1,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null
    ) {
        $this->validateName($name);
        $this->validateCode($code);
        $this->validateStatus($status);

        if ($email !== null) {
            $this->validateEmail($email);
        }

        $this->id = $id;
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
        $this->version = $version;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function getContactPerson(): ?string
    {
        return $this->contactPerson;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function getState(): ?string
    {
        return $this->state;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function getPostalCode(): ?string
    {
        return $this->postalCode;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    // Business methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function activate(): void
    {
        $this->status = 'active';
        $this->incrementVersion();
    }

    public function deactivate(): void
    {
        $this->status = 'inactive';
        $this->incrementVersion();
    }

    public function updateContactInfo(
        ?string $contactPerson = null,
        ?string $phone = null,
        ?string $email = null
    ): void {
        if ($email !== null) {
            $this->validateEmail($email);
        }

        if ($contactPerson !== null) {
            $this->contactPerson = $contactPerson;
        }
        if ($phone !== null) {
            $this->phone = $phone;
        }
        if ($email !== null) {
            $this->email = $email;
        }

        $this->incrementVersion();
    }

    public function updateAddress(
        ?string $address = null,
        ?string $city = null,
        ?string $state = null,
        ?string $country = null,
        ?string $postalCode = null
    ): void {
        if ($address !== null) {
            $this->address = $address;
        }
        if ($city !== null) {
            $this->city = $city;
        }
        if ($state !== null) {
            $this->state = $state;
        }
        if ($country !== null) {
            $this->country = $country;
        }
        if ($postalCode !== null) {
            $this->postalCode = $postalCode;
        }

        $this->incrementVersion();
    }

    public function incrementVersion(): void
    {
        $this->version++;
    }

    // Validation methods (business rules)
    private function validateName(string $name): void
    {
        if (empty(trim($name))) {
            throw new \InvalidArgumentException('Supplier name cannot be empty');
        }

        if (strlen($name) > 255) {
            throw new \InvalidArgumentException('Supplier name cannot exceed 255 characters');
        }
    }

    private function validateCode(string $code): void
    {
        if (empty(trim($code))) {
            throw new \InvalidArgumentException('Supplier code cannot be empty');
        }

        if (strlen($code) > 50) {
            throw new \InvalidArgumentException('Supplier code cannot exceed 50 characters');
        }
    }

    private function validateEmail(string $email): void
    {
        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
        }
    }

    private function validateStatus(string $status): void
    {
        $validStatuses = ['active', 'inactive'];
        if (! in_array($status, $validStatuses)) {
            throw new \InvalidArgumentException('Invalid status. Must be one of: '.implode(', ', $validStatuses));
        }
    }

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
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
