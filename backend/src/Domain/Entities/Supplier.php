<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Entities;

use DateTimeImmutable;

/**
 * Supplier Entity
 * 
 * Represents a supplier with detailed profile information.
 * Supports multi-unit quantity tracking and payment management.
 */
final class Supplier
{
    private ?int $id;
    private string $name;
    private string $code;
    private ?string $phone;
    private ?string $email;
    private ?string $address;
    private ?string $notes;
    private bool $isActive;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    public function __construct(
        string $name,
        string $code,
        ?string $phone = null,
        ?string $email = null,
        ?string $address = null,
        ?string $notes = null,
        bool $isActive = true,
        ?int $id = null,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->validateName($name);
        $this->validateCode($code);
        
        if ($email !== null) {
            $this->validateEmail($email);
        }
        
        $this->id = $id;
        $this->name = $name;
        $this->code = $code;
        $this->phone = $phone;
        $this->email = $email;
        $this->address = $address;
        $this->notes = $notes;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
    }

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

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function updateProfile(
        string $name,
        ?string $phone = null,
        ?string $email = null,
        ?string $address = null,
        ?string $notes = null
    ): void {
        $this->validateName($name);
        
        if ($email !== null) {
            $this->validateEmail($email);
        }
        
        $this->name = $name;
        $this->phone = $phone;
        $this->email = $email;
        $this->address = $address;
        $this->notes = $notes;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function activate(): void
    {
        $this->isActive = true;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function deactivate(): void
    {
        $this->isActive = false;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function delete(): void
    {
        $this->deletedAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'notes' => $this->notes,
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s')
        ];
    }

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
        
        if (!preg_match('/^[A-Z0-9-]+$/', $code)) {
            throw new \InvalidArgumentException(
                'Supplier code must contain only uppercase letters, numbers, and hyphens'
            );
        }
    }

    private function validateEmail(string $email): void
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
        }
    }
}
