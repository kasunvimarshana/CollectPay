<?php

namespace App\Domain\Services;

use App\Domain\ValueObjects\Quantity;

/**
 * Unit Conversion Service
 * 
 * Domain service for converting between different units.
 * Following Domain-Driven Design principles.
 */
class UnitConversionService
{
    /**
     * Convert quantity from one unit to another
     */
    public function convert(float $value, string $fromUnit, string $toUnit): float
    {
        $quantity = Quantity::from($value, $fromUnit);
        $converted = $quantity->convertTo($toUnit);
        return $converted->value();
    }

    /**
     * Normalize quantity to base unit
     */
    public function normalizeToBaseUnit(float $value, string $unit): float
    {
        $quantity = Quantity::from($value, $unit);
        return $quantity->toBaseUnit();
    }

    /**
     * Check if two quantities are equivalent
     */
    public function areEquivalent(
        float $value1,
        string $unit1,
        float $value2,
        string $unit2
    ): bool {
        $quantity1 = Quantity::from($value1, $unit1);
        $quantity2 = Quantity::from($value2, $unit2);
        return $quantity1->equals($quantity2);
    }
}
