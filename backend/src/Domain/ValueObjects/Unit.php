<?php

declare(strict_types=1);

namespace Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Unit Value Object
 * Represents a unit of measurement with conversion support
 */
final class Unit
{
    private const SUPPORTED_UNITS = [
        // Weight
        'kg' => 'kilogram',
        'g' => 'gram',
        'mg' => 'milligram',
        'lb' => 'pound',
        'oz' => 'ounce',
        
        // Volume
        'l' => 'liter',
        'ml' => 'milliliter',
        'gal' => 'gallon',
        
        // Count
        'unit' => 'unit',
        'piece' => 'piece',
        'dozen' => 'dozen',
    ];

    private const CONVERSION_FACTORS = [
        // Weight conversions to grams
        'kg' => 1000.0,
        'g' => 1.0,
        'mg' => 0.001,
        'lb' => 453.592,
        'oz' => 28.3495,
        
        // Volume conversions to milliliters
        'l' => 1000.0,
        'ml' => 1.0,
        'gal' => 3785.41,
    ];

    private string $symbol;

    private function __construct(string $symbol)
    {
        $this->validate($symbol);
        $this->symbol = strtolower($symbol);
    }

    public static function fromString(string $symbol): self
    {
        return new self($symbol);
    }

    private function validate(string $symbol): void
    {
        $lowercaseSymbol = strtolower($symbol);
        if (!isset(self::SUPPORTED_UNITS[$lowercaseSymbol])) {
            throw new InvalidArgumentException("Unsupported unit: {$symbol}");
        }
    }

    public function toString(): string
    {
        return $this->symbol;
    }

    public function getName(): string
    {
        return self::SUPPORTED_UNITS[$this->symbol];
    }

    public function equals(self $other): bool
    {
        return $this->symbol === $other->symbol;
    }

    public function convertTo(float $value, self $targetUnit): float
    {
        if ($this->equals($targetUnit)) {
            return $value;
        }

        // Check if units are in the same category
        if (!$this->isSameCategory($targetUnit)) {
            throw new InvalidArgumentException(
                "Cannot convert from {$this->symbol} to {$targetUnit->symbol}: different categories"
            );
        }

        // Convert to base unit, then to target unit
        $baseValue = $value * $this->getConversionFactor();
        return $baseValue / $targetUnit->getConversionFactor();
    }

    private function getConversionFactor(): float
    {
        return self::CONVERSION_FACTORS[$this->symbol] ?? 1.0;
    }

    private function isSameCategory(self $other): bool
    {
        $thisHasFactor = isset(self::CONVERSION_FACTORS[$this->symbol]);
        $otherHasFactor = isset(self::CONVERSION_FACTORS[$other->symbol]);

        // Both have conversion factors - check if they're in same category
        if ($thisHasFactor && $otherHasFactor) {
            // Weight units
            $weightUnits = ['kg', 'g', 'mg', 'lb', 'oz'];
            $thisIsWeight = in_array($this->symbol, $weightUnits);
            $otherIsWeight = in_array($other->symbol, $weightUnits);

            if ($thisIsWeight && $otherIsWeight) {
                return true;
            }

            // Volume units
            $volumeUnits = ['l', 'ml', 'gal'];
            $thisIsVolume = in_array($this->symbol, $volumeUnits);
            $otherIsVolume = in_array($other->symbol, $volumeUnits);

            return $thisIsVolume && $otherIsVolume;
        }

        // For count units, only allow conversion if same unit
        return $this->equals($other);
    }

    public function __toString(): string
    {
        return $this->symbol;
    }
}
