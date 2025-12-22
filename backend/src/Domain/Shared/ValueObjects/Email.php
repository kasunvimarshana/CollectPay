<?php

namespace Domain\Shared\ValueObjects;

use InvalidArgumentException;
use JsonSerializable;

/**
 * Email Value Object
 */
final class Email implements JsonSerializable
{
    private string $value;

    private function __construct(string $value)
    {
        $this->ensureIsValid($value);
        $this->value = strtolower($value);
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(Email $other): bool
    {
        return $this->value === $other->value;
    }

    public function jsonSerialize(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    private function ensureIsValid(string $value): void
    {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Invalid email format: {$value}");
        }
    }
}
