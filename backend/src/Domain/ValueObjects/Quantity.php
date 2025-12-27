<?php

declare(strict_types=1);

namespace TrackVault\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Quantity Value Object
 * 
 * Supports multi-unit quantity tracking
 */
final class Quantity
{
    private float $value;
    private string $unit;

    public function __construct(float $value, string $unit)
    {
        if ($value < 0) {
            throw new InvalidArgumentException('Quantity value cannot be negative');
        }
        
        if (empty($unit)) {
            throw new InvalidArgumentException('Unit cannot be empty');
        }
        
        $this->value = $value;
        $this->unit = strtolower($unit);
    }

    public function getValue(): float
    {
        return $this->value;
    }

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function add(Quantity $other): self
    {
        $this->assertSameUnit($other);
        return new self($this->value + $other->value, $this->unit);
    }

    public function subtract(Quantity $other): self
    {
        $this->assertSameUnit($other);
        return new self($this->value - $other->value, $this->unit);
    }

    public function multiply(float $multiplier): self
    {
        return new self($this->value * $multiplier, $this->unit);
    }

    public function convertTo(string $targetUnit): self
    {
        $convertedValue = $this->performConversion($this->value, $this->unit, $targetUnit);
        return new self($convertedValue, $targetUnit);
    }

    private function performConversion(float $value, string $fromUnit, string $toUnit): float
    {
        // Weight conversions
        $weightConversions = [
            'kg' => 1000,
            'g' => 1,
            'mg' => 0.001,
            't' => 1000000,
        ];

        // Volume conversions
        $volumeConversions = [
            'l' => 1000,
            'ml' => 1,
            'kl' => 1000000,
        ];

        // Check if both units are in the same category
        if (isset($weightConversions[$fromUnit]) && isset($weightConversions[$toUnit])) {
            // Convert to grams first, then to target unit
            $grams = $value * $weightConversions[$fromUnit];
            return $grams / $weightConversions[$toUnit];
        }

        if (isset($volumeConversions[$fromUnit]) && isset($volumeConversions[$toUnit])) {
            // Convert to ml first, then to target unit
            $ml = $value * $volumeConversions[$fromUnit];
            return $ml / $volumeConversions[$toUnit];
        }

        throw new InvalidArgumentException("Cannot convert from {$fromUnit} to {$toUnit}");
    }

    private function assertSameUnit(Quantity $other): void
    {
        if ($this->unit !== $other->unit) {
            throw new InvalidArgumentException(
                "Cannot perform operation on different units: {$this->unit} and {$other->unit}"
            );
        }
    }

    public function equals(Quantity $other): bool
    {
        return $this->value === $other->value && $this->unit === $other->unit;
    }

    public function toString(): string
    {
        return sprintf('%.2f %s', $this->value, $this->unit);
    }
}
