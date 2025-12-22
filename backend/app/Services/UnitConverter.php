<?php

namespace App\Services;

class UnitConverter
{
    public static function toBase(string $unit, float $quantity): array
    {
        switch ($unit) {
            case 'g': return ['unit' => 'kg', 'quantity' => $quantity / 1000.0];
            case 'kg': return ['unit' => 'kg', 'quantity' => $quantity];
            case 'ml': return ['unit' => 'l', 'quantity' => $quantity / 1000.0];
            case 'l': return ['unit' => 'l', 'quantity' => $quantity];
            default: return ['unit' => $unit, 'quantity' => $quantity];
        }
    }
}
