<?php

namespace Domain\Collection;

use InvalidArgumentException;
use JsonSerializable;

/**
 * Quantity Value Object - Handles product quantities with units
 */
final class Quantity implements JsonSerializable
{
    private float $value;
    private string $unit;

    private const VALID_UNITS = ['g', 'kg', 'l', 'ml', 'unit'];

    private function __construct(float $value, string $unit)
    {
        $this->ensureIsValidValue($value);
        $this->ensureIsValidUnit($unit);
        $this->value = $value;
        $this->unit = strtolower($unit);
    }

    public static function fromValue(float $value, string $unit): self
    {
        return new self($value, $unit);
    }

    public function value(): float
    {
        return $this->value;
    }

    public function unit(): string
    {
        return $this->unit;
    }

    public function add(Quantity $other): self
    {
        $this->ensureSameUnit($other);
        return new self($this->value + $other->value, $this->unit);
    }

    public function subtract(Quantity $other): self
    {
        $this->ensureSameUnit($other);
        return new self($this->value - $other->value, $this->unit);
    }

    public function equals(Quantity $other): bool
    {
        return abs($this->value - $other->value) < 0.001 && $this->unit === $other->unit;
    }

    public function jsonSerialize(): array
    {
        return [
            'value' => $this->value,
            'unit' => $this->unit,
        ];
    }

    public function __toString(): string
    {
        return "{$this->value} {$this->unit}";
    }

    private function ensureIsValidValue(float $value): void
    {
        if ($value <= 0) {
            throw new InvalidArgumentException("Quantity must be positive");
        }
    }

    private function ensureIsValidUnit(string $unit): void
    {
        if (!in_array(strtolower($unit), self::VALID_UNITS)) {
            throw new InvalidArgumentException("Invalid unit: {$unit}");
        }
    }

    private function ensureSameUnit(Quantity $other): void
    {
        if ($this->unit !== $other->unit) {
            throw new InvalidArgumentException("Cannot operate on different units");
        }
    }
}
