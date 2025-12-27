<?php

declare(strict_types=1);

namespace TrackVault\Domain\Entities;

use TrackVault\Domain\ValueObjects\SupplierId;
use DateTimeImmutable;

/**
 * Supplier Entity
 * 
 * Represents a supplier with detailed profile information
 */
final class Supplier
{
    private SupplierId $id;
    private string $name;
    private string $contactPerson;
    private string $phone;
    private string $email;
    private string $address;
    private ?string $bankAccount;
    private ?string $taxId;
    private array $metadata;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;
    private int $version;

    public function __construct(
        SupplierId $id,
        string $name,
        string $contactPerson,
        string $phone,
        string $email,
        string $address,
        ?string $bankAccount = null,
        ?string $taxId = null,
        array $metadata = [],
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null,
        int $version = 1
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->contactPerson = $contactPerson;
        $this->phone = $phone;
        $this->email = $email;
        $this->address = $address;
        $this->bankAccount = $bankAccount;
        $this->taxId = $taxId;
        $this->metadata = $metadata;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
        $this->version = $version;
    }

    public function getId(): SupplierId
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getContactPerson(): string
    {
        return $this->contactPerson;
    }

    public function getPhone(): string
    {
        return $this->phone;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getAddress(): string
    {
        return $this->address;
    }

    public function getBankAccount(): ?string
    {
        return $this->bankAccount;
    }

    public function getTaxId(): ?string
    {
        return $this->taxId;
    }

    public function getMetadata(): array
    {
        return $this->metadata;
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

    public function getVersion(): int
    {
        return $this->version;
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }

    public function update(
        string $name,
        string $contactPerson,
        string $phone,
        string $email,
        string $address,
        ?string $bankAccount,
        ?string $taxId,
        array $metadata
    ): self {
        return new self(
            $this->id,
            $name,
            $contactPerson,
            $phone,
            $email,
            $address,
            $bankAccount,
            $taxId,
            $metadata,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->deletedAt,
            $this->version + 1
        );
    }

    public function delete(): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->contactPerson,
            $this->phone,
            $this->email,
            $this->address,
            $this->bankAccount,
            $this->taxId,
            $this->metadata,
            $this->createdAt,
            new DateTimeImmutable(),
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->toString(),
            'name' => $this->name,
            'contact_person' => $this->contactPerson,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'bank_account' => $this->bankAccount,
            'tax_id' => $this->taxId,
            'metadata' => $this->metadata,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
            'version' => $this->version,
        ];
    }
}
