<?php

declare(strict_types=1);

namespace Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Quantity Value Object
 * 
 * Represents a measured quantity with a specific unit.
 */
final class Quantity
{
    private function __construct(
        private readonly float $value,
        private readonly Unit $unit
    ) {
        $this->validate();
    }

    public static function from(float $value, Unit $unit): self
    {
        return new self($value, $unit);
    }

    public static function zero(Unit $unit): self
    {
        return new self(0.0, $unit);
    }

    public function value(): float
    {
        return $this->value;
    }

    public function unit(): Unit
    {
        return $this->unit;
    }

    public function add(Quantity $other): self
    {
        if (!$this->unit->isCompatibleWith($other->unit)) {
            throw new InvalidArgumentException('Cannot add quantities with incompatible units');
        }

        $convertedValue = $other->unit->convertTo($this->unit, $other->value);
        return new self($this->value + $convertedValue, $this->unit);
    }

    public function subtract(Quantity $other): self
    {
        if (!$this->unit->isCompatibleWith($other->unit)) {
            throw new InvalidArgumentException('Cannot subtract quantities with incompatible units');
        }

        $convertedValue = $other->unit->convertTo($this->unit, $other->value);
        return new self($this->value - $convertedValue, $this->unit);
    }

    public function multiply(float $multiplier): self
    {
        return new self($this->value * $multiplier, $this->unit);
    }

    public function convertTo(Unit $targetUnit): self
    {
        $convertedValue = $this->unit->convertTo($targetUnit, $this->value);
        return new self($convertedValue, $targetUnit);
    }

    public function equals(Quantity $other): bool
    {
        if (!$this->unit->isCompatibleWith($other->unit)) {
            return false;
        }

        $convertedValue = $other->unit->convertTo($this->unit, $other->value);
        return abs($this->value - $convertedValue) < 0.0001; // Floating point comparison
    }

    public function isGreaterThan(Quantity $other): bool
    {
        if (!$this->unit->isCompatibleWith($other->unit)) {
            throw new InvalidArgumentException('Cannot compare quantities with incompatible units');
        }

        $convertedValue = $other->unit->convertTo($this->unit, $other->value);
        return $this->value > $convertedValue;
    }

    public function isNegative(): bool
    {
        return $this->value < 0;
    }

    public function isZero(): bool
    {
        return abs($this->value) < 0.0001;
    }

    private function validate(): void
    {
        if (!is_finite($this->value)) {
            throw new InvalidArgumentException('Quantity value must be finite');
        }
    }

    public function toArray(): array
    {
        return [
            'value' => $this->value,
            'unit' => $this->unit->symbol(),
        ];
    }

    public function __toString(): string
    {
        return sprintf('%.3f %s', $this->value, $this->unit);
    }
}
