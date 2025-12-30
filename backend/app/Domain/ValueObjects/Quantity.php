<?php

namespace App\Domain\ValueObjects;

/**
 * Quantity Value Object
 * 
 * Represents a quantity with a unit of measurement.
 * Supports multi-unit tracking and conversions.
 * Immutable value object.
 */
class Quantity
{
    private float $value;
    private string $unit;

    // Supported units and their conversion factors to base unit (kg)
    private const UNIT_CONVERSIONS = [
        'kg' => 1.0,
        'g' => 0.001,
        'mg' => 0.000001,
        't' => 1000.0,
        'lb' => 0.453592,
        'oz' => 0.0283495,
        'l' => 1.0,  // For liquids, using 1:1 with kg
        'ml' => 0.001,
        'unit' => 1.0,  // For countable items
    ];

    public function __construct(float $value, string $unit)
    {
        $this->validate($value, $unit);
        $this->value = $value;
        $this->unit = strtolower($unit);
    }

    private function validate(float $value, string $unit): void
    {
        if ($value < 0) {
            throw new \InvalidArgumentException('Quantity value cannot be negative');
        }

        $unitLower = strtolower($unit);
        if (!isset(self::UNIT_CONVERSIONS[$unitLower])) {
            throw new \InvalidArgumentException("Unsupported unit: {$unit}. Supported units: " . implode(', ', array_keys(self::UNIT_CONVERSIONS)));
        }
    }

    public function getValue(): float
    {
        return $this->value;
    }

    public function getUnit(): string
    {
        return $this->unit;
    }

    /**
     * Convert this quantity to a different unit
     */
    public function convertTo(string $targetUnit): Quantity
    {
        $targetUnitLower = strtolower($targetUnit);
        
        if (!isset(self::UNIT_CONVERSIONS[$targetUnitLower])) {
            throw new \InvalidArgumentException("Unsupported target unit: {$targetUnit}");
        }

        // Convert to base unit first, then to target unit
        $baseValue = $this->value * self::UNIT_CONVERSIONS[$this->unit];
        $targetValue = $baseValue / self::UNIT_CONVERSIONS[$targetUnitLower];

        return new Quantity($targetValue, $targetUnit);
    }

    /**
     * Get quantity in base unit (kg)
     */
    public function toBaseUnit(): float
    {
        return $this->value * self::UNIT_CONVERSIONS[$this->unit];
    }

    /**
     * Add two quantities (they will be converted to the same unit if different)
     */
    public function add(Quantity $other): Quantity
    {
        $otherConverted = $other->convertTo($this->unit);
        return new Quantity($this->value + $otherConverted->getValue(), $this->unit);
    }

    /**
     * Subtract two quantities
     */
    public function subtract(Quantity $other): Quantity
    {
        $otherConverted = $other->convertTo($this->unit);
        $result = $this->value - $otherConverted->getValue();
        
        if ($result < 0) {
            throw new \InvalidArgumentException('Subtraction would result in negative quantity');
        }
        
        return new Quantity($result, $this->unit);
    }

    /**
     * Multiply quantity by a scalar
     */
    public function multiply(float $multiplier): Quantity
    {
        if ($multiplier < 0) {
            throw new \InvalidArgumentException('Multiplier cannot be negative');
        }
        
        return new Quantity($this->value * $multiplier, $this->unit);
    }

    /**
     * Check if two quantities are equal
     */
    public function equals(Quantity $other): bool
    {
        return abs($this->toBaseUnit() - $other->toBaseUnit()) < 0.000001;
    }

    /**
     * Compare two quantities
     * Returns: -1 if this < other, 0 if equal, 1 if this > other
     */
    public function compareTo(Quantity $other): int
    {
        $diff = $this->toBaseUnit() - $other->toBaseUnit();
        
        if (abs($diff) < 0.000001) {
            return 0;
        }
        
        return $diff < 0 ? -1 : 1;
    }

    public function toString(): string
    {
        return sprintf('%.4f %s', $this->value, $this->unit);
    }

    public function toArray(): array
    {
        return [
            'value' => $this->value,
            'unit' => $this->unit,
        ];
    }

    /**
     * Create from array
     */
    public static function fromArray(array $data): Quantity
    {
        return new self($data['value'], $data['unit']);
    }

    /**
     * Get list of supported units
     */
    public static function getSupportedUnits(): array
    {
        return array_keys(self::UNIT_CONVERSIONS);
    }
}
