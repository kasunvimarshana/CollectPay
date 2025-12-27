<?php

declare(strict_types=1);

namespace TrackVault\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Email Value Object
 */
final class Email
{
    private string $value;

    public function __construct(string $value)
    {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Invalid email address: {$value}");
        }
        $this->value = strtolower($value);
    }

    public function toString(): string
    {
        return $this->value;
    }

    public function equals(Email $other): bool
    {
        return $this->value === $other->value;
    }
}
