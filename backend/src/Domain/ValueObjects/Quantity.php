<?php

namespace App\Domain\ValueObjects;

/**
 * Quantity Value Object
 * 
 * Represents quantities with unit conversion support.
 */
final class Quantity
{
    // Base unit conversions to grams
    private const UNIT_CONVERSIONS = [
        'g' => 1.0,
        'kg' => 1000.0,
        'lb' => 453.592,
        'oz' => 28.3495,
        'ml' => 1.0,
        'l' => 1000.0,
        'unit' => 1.0,
    ];

    private function __construct(
        private readonly float $value,
        private readonly string $unit
    ) {
        if ($value <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive');
        }
        
        if (!isset(self::UNIT_CONVERSIONS[$unit])) {
            throw new \InvalidArgumentException('Invalid unit');
        }
    }

    public static function from(float $value, string $unit): self
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

    /**
     * Convert to base unit (grams/ml)
     */
    public function toBaseUnit(): float
    {
        return $this->value * self::UNIT_CONVERSIONS[$this->unit];
    }

    /**
     * Convert to another unit
     */
    public function convertTo(string $targetUnit): self
    {
        if (!isset(self::UNIT_CONVERSIONS[$targetUnit])) {
            throw new \InvalidArgumentException('Invalid target unit');
        }

        $baseValue = $this->toBaseUnit();
        $convertedValue = $baseValue / self::UNIT_CONVERSIONS[$targetUnit];

        return new self($convertedValue, $targetUnit);
    }

    /**
     * Add quantities (converts to same unit)
     */
    public function add(Quantity $other): self
    {
        $thisBase = $this->toBaseUnit();
        $otherBase = $other->toBaseUnit();
        $totalBase = $thisBase + $otherBase;
        
        $result = $totalBase / self::UNIT_CONVERSIONS[$this->unit];
        return new self($result, $this->unit);
    }

    public function equals(Quantity $other): bool
    {
        return abs($this->toBaseUnit() - $other->toBaseUnit()) < 0.001;
    }

    public function format(): string
    {
        return sprintf('%.2f %s', $this->value, $this->unit);
    }

    public function __toString(): string
    {
        return $this->format();
    }
}
