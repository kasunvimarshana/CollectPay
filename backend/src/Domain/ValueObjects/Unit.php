<?php

declare(strict_types=1);

namespace Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Unit Value Object
 * 
 * Represents a measurement unit (e.g., kg, g, liters).
 * Supports unit conversion.
 */
final class Unit
{
    private const VALID_UNITS = [
        'kg' => ['base' => 'kg', 'factor' => 1.0],
        'g' => ['base' => 'kg', 'factor' => 0.001],
        'mg' => ['base' => 'kg', 'factor' => 0.000001],
        'ton' => ['base' => 'kg', 'factor' => 1000.0],
        'l' => ['base' => 'l', 'factor' => 1.0],
        'ml' => ['base' => 'l', 'factor' => 0.001],
        'unit' => ['base' => 'unit', 'factor' => 1.0],
    ];

    private function __construct(
        private readonly string $symbol
    ) {
        $this->validate();
    }

    public static function from(string $symbol): self
    {
        return new self(strtolower($symbol));
    }

    public static function kilogram(): self
    {
        return new self('kg');
    }

    public static function gram(): self
    {
        return new self('g');
    }

    public static function liter(): self
    {
        return new self('l');
    }

    public function symbol(): string
    {
        return $this->symbol;
    }

    public function baseUnit(): string
    {
        return self::VALID_UNITS[$this->symbol]['base'];
    }

    public function conversionFactor(): float
    {
        return self::VALID_UNITS[$this->symbol]['factor'];
    }

    public function convertTo(Unit $targetUnit, float $value): float
    {
        if ($this->baseUnit() !== $targetUnit->baseUnit()) {
            throw new InvalidArgumentException(
                "Cannot convert between incompatible units: {$this->symbol} and {$targetUnit->symbol}"
            );
        }

        $baseValue = $value * $this->conversionFactor();
        return $baseValue / $targetUnit->conversionFactor();
    }

    public function isCompatibleWith(Unit $other): bool
    {
        return $this->baseUnit() === $other->baseUnit();
    }

    public function equals(Unit $other): bool
    {
        return $this->symbol === $other->symbol;
    }

    private function validate(): void
    {
        if (!isset(self::VALID_UNITS[$this->symbol])) {
            throw new InvalidArgumentException("Invalid unit: {$this->symbol}");
        }
    }

    public function __toString(): string
    {
        return $this->symbol;
    }
}
