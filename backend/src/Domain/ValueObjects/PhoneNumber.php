<?php

declare(strict_types=1);

namespace Domain\ValueObjects;

use InvalidArgumentException;

/**
 * PhoneNumber Value Object
 * 
 * Represents a validated phone number.
 */
final class PhoneNumber
{
    private function __construct(
        private readonly string $value
    ) {
        $this->validate();
    }

    public static function from(string $value): self
    {
        return new self($value);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(PhoneNumber $other): bool
    {
        return $this->value === $other->value;
    }

    private function validate(): void
    {
        // Remove common formatting characters
        $cleaned = preg_replace('/[\s\-\(\)\+]/', '', $this->value);
        
        if (empty($cleaned)) {
            throw new InvalidArgumentException('Phone number cannot be empty');
        }

        if (!preg_match('/^\d{7,15}$/', $cleaned)) {
            throw new InvalidArgumentException("Invalid phone number format: {$this->value}");
        }
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
