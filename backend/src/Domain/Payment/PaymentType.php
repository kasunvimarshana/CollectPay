<?php

namespace Domain\Payment;

use InvalidArgumentException;

/**
 * PaymentType Value Object
 */
final class PaymentType
{
    private string $value;

    private const ADVANCE = 'advance';
    private const PARTIAL = 'partial';
    private const FULL = 'full';

    private const VALID_TYPES = [
        self::ADVANCE,
        self::PARTIAL,
        self::FULL,
    ];

    private function __construct(string $value)
    {
        $this->ensureIsValid($value);
        $this->value = $value;
    }

    public static function advance(): self
    {
        return new self(self::ADVANCE);
    }

    public static function partial(): self
    {
        return new self(self::PARTIAL);
    }

    public static function full(): self
    {
        return new self(self::FULL);
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function isAdvance(): bool
    {
        return $this->value === self::ADVANCE;
    }

    public function isPartial(): bool
    {
        return $this->value === self::PARTIAL;
    }

    public function isFull(): bool
    {
        return $this->value === self::FULL;
    }

    public function equals(PaymentType $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    private function ensureIsValid(string $value): void
    {
        if (!in_array($value, self::VALID_TYPES)) {
            throw new InvalidArgumentException("Invalid payment type: {$value}");
        }
    }
}
