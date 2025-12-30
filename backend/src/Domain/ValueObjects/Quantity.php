<?php

declare(strict_types=1);

namespace Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Quantity Value Object
 * Represents a quantity with a specific unit of measurement
 */
final class Quantity
{
    private float $value;
    private Unit $unit;

    private function __construct(float $value, Unit $unit)
    {
        $this->validate($value);
        $this->value = $value;
        $this->unit = $unit;
    }

    public static function create(float $value, Unit $unit): self
    {
        return new self($value, $unit);
    }

    private function validate(float $value): void
    {
        if ($value < 0) {
            throw new InvalidArgumentException('Quantity cannot be negative');
        }
    }

    public function getValue(): float
    {
        return $this->value;
    }

    public function getUnit(): Unit
    {
        return $this->unit;
    }

    public function add(self $other): self
    {
        $this->ensureSameUnit($other);
        return new self($this->value + $other->value, $this->unit);
    }

    public function subtract(self $other): self
    {
        $this->ensureSameUnit($other);
        return new self($this->value - $other->value, $this->unit);
    }

    public function multiply(float $multiplier): self
    {
        return new self($this->value * $multiplier, $this->unit);
    }

    public function convertTo(Unit $targetUnit): self
    {
        $convertedValue = $this->unit->convertTo($this->value, $targetUnit);
        return new self($convertedValue, $targetUnit);
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value && $this->unit->equals($other->unit);
    }

    private function ensureSameUnit(self $other): void
    {
        if (!$this->unit->equals($other->unit)) {
            throw new InvalidArgumentException('Cannot operate on different units');
        }
    }

    public function toArray(): array
    {
        return [
            'value' => $this->value,
            'unit' => $this->unit->toString(),
        ];
    }
}
