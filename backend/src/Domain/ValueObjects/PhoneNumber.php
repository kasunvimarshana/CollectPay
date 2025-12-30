<?php

declare(strict_types=1);

namespace Domain\ValueObjects;

use InvalidArgumentException;

/**
 * PhoneNumber Value Object
 * 
 * Immutable value object representing a phone number
 * Validates basic phone number format
 */
final class PhoneNumber
{
    private string $value;

    public function __construct(string $value)
    {
        $this->validate($value);
        $this->value = $this->normalize($value);
    }

    private function validate(string $value): void
    {
        if (empty($value)) {
            throw new InvalidArgumentException('Phone number cannot be empty');
        }

        // Basic validation: contains digits and may contain + - () and spaces
        if (!preg_match('/^[\d\s\-\+\(\)]+$/', $value)) {
            throw new InvalidArgumentException("Invalid phone number format: {$value}");
        }

        // Must contain at least 10 digits
        $digitsOnly = preg_replace('/[^\d]/', '', $value);
        if (strlen($digitsOnly) < 10) {
            throw new InvalidArgumentException('Phone number must contain at least 10 digits');
        }
    }

    private function normalize(string $value): string
    {
        // Keep original format but trim whitespace
        return trim($value);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(PhoneNumber $other): bool
    {
        return $this->value === $other->value();
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
