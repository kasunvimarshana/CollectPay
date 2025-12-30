<?php

declare(strict_types=1);

namespace Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Quantity Value Object
 * 
 * Represents quantities with units (kg, g, liters, etc.)
 * Supports multi-unit tracking
 */
final class Quantity
{
    private float $amount;
    private string $unit;

    // Supported units with base conversions (to grams for weight, ml for volume)
    private const WEIGHT_UNITS = [
        'kg' => 1000,
        'g' => 1,
        'mg' => 0.001,
    ];

    private const VOLUME_UNITS = [
        'l' => 1000,
        'ml' => 1,
    ];

    public function __construct(float $amount, string $unit)
    {
        $this->validateAmount($amount);
        $this->validateUnit($unit);
        
        $this->amount = $amount;
        $this->unit = strtolower($unit);
    }

    private function validateAmount(float $amount): void
    {
        if ($amount < 0) {
            throw new InvalidArgumentException('Quantity amount cannot be negative');
        }
    }

    private function validateUnit(string $unit): void
    {
        $unit = strtolower($unit);
        
        if (empty(trim($unit))) {
            throw new InvalidArgumentException('Unit cannot be empty');
        }

        if (!isset(self::WEIGHT_UNITS[$unit]) && !isset(self::VOLUME_UNITS[$unit])) {
            throw new InvalidArgumentException("Unsupported unit: {$unit}");
        }
    }

    public function amount(): float
    {
        return $this->amount;
    }

    public function unit(): string
    {
        return $this->unit;
    }

    public function convertTo(string $targetUnit): self
    {
        $targetUnit = strtolower($targetUnit);
        $this->validateUnit($targetUnit);

        // Check if both units are in the same category
        $sourceIsWeight = isset(self::WEIGHT_UNITS[$this->unit]);
        $targetIsWeight = isset(self::WEIGHT_UNITS[$targetUnit]);

        if ($sourceIsWeight !== $targetIsWeight) {
            throw new InvalidArgumentException('Cannot convert between weight and volume units');
        }

        if ($sourceIsWeight) {
            $baseAmount = $this->amount * self::WEIGHT_UNITS[$this->unit];
            $convertedAmount = $baseAmount / self::WEIGHT_UNITS[$targetUnit];
        } else {
            $baseAmount = $this->amount * self::VOLUME_UNITS[$this->unit];
            $convertedAmount = $baseAmount / self::VOLUME_UNITS[$targetUnit];
        }

        return new self($convertedAmount, $targetUnit);
    }

    public function add(Quantity $other): self
    {
        $converted = $other->convertTo($this->unit);
        return new self($this->amount + $converted->amount, $this->unit);
    }

    public function formatted(): string
    {
        return sprintf('%.2f %s', $this->amount, $this->unit);
    }

    public function __toString(): string
    {
        return $this->formatted();
    }
}
