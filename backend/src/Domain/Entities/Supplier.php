<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\UUID;
use Domain\ValueObjects\Email;
use Domain\ValueObjects\PhoneNumber;
use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Supplier Domain Entity
 * 
 * Represents a supplier in the system with complete business logic
 * Immutable after creation, follows DDD principles
 */
final class Supplier
{
    private UUID $id;
    private string $name;
    private string $code;
    private ?Email $email;
    private ?PhoneNumber $phone;
    private ?string $address;
    private bool $active;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private int $version;

    private function __construct(
        UUID $id,
        string $name,
        string $code,
        ?Email $email,
        ?PhoneNumber $phone,
        ?string $address,
        bool $active,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        int $version
    ) {
        $this->validateName($name);
        $this->validateCode($code);
        
        $this->id = $id;
        $this->name = trim($name);
        $this->code = strtoupper(trim($code));
        $this->email = $email;
        $this->phone = $phone;
        $this->address = $address ? trim($address) : null;
        $this->active = $active;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->version = $version;
    }

    public static function create(
        string $name,
        string $code,
        ?string $email = null,
        ?string $phone = null,
        ?string $address = null
    ): self {
        return new self(
            UUID::generate(),
            $name,
            $code,
            $email ? new Email($email) : null,
            $phone ? new PhoneNumber($phone) : null,
            $address,
            true,
            new DateTimeImmutable(),
            new DateTimeImmutable(),
            1
        );
    }

    public static function reconstitute(
        string $id,
        string $name,
        string $code,
        ?string $email,
        ?string $phone,
        ?string $address,
        bool $active,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        int $version
    ): self {
        return new self(
            UUID::fromString($id),
            $name,
            $code,
            $email ? new Email($email) : null,
            $phone ? new PhoneNumber($phone) : null,
            $address,
            $active,
            $createdAt,
            $updatedAt,
            $version
        );
    }

    public function update(
        string $name,
        ?string $email = null,
        ?string $phone = null,
        ?string $address = null
    ): self {
        return new self(
            $this->id,
            $name,
            $this->code,
            $email ? new Email($email) : null,
            $phone ? new PhoneNumber($phone) : null,
            $address,
            $this->active,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    public function activate(): self
    {
        if ($this->active) {
            return $this;
        }

        return new self(
            $this->id,
            $this->name,
            $this->code,
            $this->email,
            $this->phone,
            $this->address,
            true,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    public function deactivate(): self
    {
        if (!$this->active) {
            return $this;
        }

        return new self(
            $this->id,
            $this->name,
            $this->code,
            $this->email,
            $this->phone,
            $this->address,
            false,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    private function validateName(string $name): void
    {
        if (empty(trim($name))) {
            throw new InvalidArgumentException('Supplier name cannot be empty');
        }

        if (strlen($name) > 255) {
            throw new InvalidArgumentException('Supplier name cannot exceed 255 characters');
        }
    }

    private function validateCode(string $code): void
    {
        if (empty(trim($code))) {
            throw new InvalidArgumentException('Supplier code cannot be empty');
        }

        if (strlen($code) > 50) {
            throw new InvalidArgumentException('Supplier code cannot exceed 50 characters');
        }

        if (!preg_match('/^[A-Z0-9_-]+$/i', $code)) {
            throw new InvalidArgumentException('Supplier code can only contain letters, numbers, hyphens and underscores');
        }
    }

    // Getters
    public function id(): UUID
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function code(): string
    {
        return $this->code;
    }

    public function email(): ?Email
    {
        return $this->email;
    }

    public function phone(): ?PhoneNumber
    {
        return $this->phone;
    }

    public function address(): ?string
    {
        return $this->address;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function version(): int
    {
        return $this->version;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'name' => $this->name,
            'code' => $this->code,
            'email' => $this->email?->value(),
            'phone' => $this->phone?->value(),
            'address' => $this->address,
            'active' => $this->active,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'version' => $this->version,
        ];
    }
}
