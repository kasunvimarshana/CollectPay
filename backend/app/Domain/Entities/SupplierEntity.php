<?php

namespace App\Domain\Entities;

/**
 * Supplier Domain Entity
 * 
 * Pure business entity representing a supplier in the domain.
 * Contains only business logic and no infrastructure dependencies.
 */
class SupplierEntity
{
    private ?int $id;
    private string $name;
    private string $code;
    private ?string $address;
    private ?string $phone;
    private ?string $email;
    private ?array $metadata;
    private bool $isActive;
    private int $version;

    public function __construct(
        string $name,
        string $code,
        ?string $address = null,
        ?string $phone = null,
        ?string $email = null,
        ?array $metadata = null,
        bool $isActive = true,
        int $version = 1,
        ?int $id = null
    ) {
        $this->validateName($name);
        $this->validateCode($code);
        if ($email) {
            $this->validateEmail($email);
        }

        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->address = $address;
        $this->phone = $phone;
        $this->email = $email;
        $this->metadata = $metadata;
        $this->isActive = $isActive;
        $this->version = $version;
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

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    // Business methods
    public function updateDetails(
        ?string $name = null,
        ?string $address = null,
        ?string $phone = null,
        ?string $email = null,
        ?array $metadata = null
    ): void {
        if ($name !== null) {
            $this->validateName($name);
            $this->name = $name;
        }

        if ($email !== null) {
            $this->validateEmail($email);
        }

        $this->address = $address ?? $this->address;
        $this->phone = $phone ?? $this->phone;
        $this->email = $email ?? $this->email;
        $this->metadata = $metadata ?? $this->metadata;
    }

    public function activate(): void
    {
        $this->isActive = true;
    }

    public function deactivate(): void
    {
        $this->isActive = false;
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

        if (strlen($code) > 255) {
            throw new \InvalidArgumentException('Supplier code cannot exceed 255 characters');
        }
    }

    private function validateEmail(string $email): void
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'metadata' => $this->metadata,
            'is_active' => $this->isActive,
            'version' => $this->version,
        ];
    }
}
