<?php

namespace Domain\Shared\ValueObjects;

use InvalidArgumentException;
use JsonSerializable;

/**
 * Location Value Object - Handles geographical coordinates
 */
final class Location implements JsonSerializable
{
    private float $latitude;
    private float $longitude;

    private function __construct(float $latitude, float $longitude)
    {
        $this->ensureIsValidLatitude($latitude);
        $this->ensureIsValidLongitude($longitude);
        $this->latitude = $latitude;
        $this->longitude = $longitude;
    }

    public static function fromCoordinates(float $latitude, float $longitude): self
    {
        return new self($latitude, $longitude);
    }

    public function latitude(): float
    {
        return $this->latitude;
    }

    public function longitude(): float
    {
        return $this->longitude;
    }

    /**
     * Calculate distance to another location in kilometers using Haversine formula
     */
    public function distanceTo(Location $other): float
    {
        $earthRadius = 6371; // km

        $latDelta = deg2rad($other->latitude - $this->latitude);
        $lonDelta = deg2rad($other->longitude - $this->longitude);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos(deg2rad($this->latitude)) * cos(deg2rad($other->latitude)) *
            sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    public function equals(Location $other): bool
    {
        return abs($this->latitude - $other->latitude) < 0.0001 &&
               abs($this->longitude - $other->longitude) < 0.0001;
    }

    public function jsonSerialize(): array
    {
        return [
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }

    private function ensureIsValidLatitude(float $latitude): void
    {
        if ($latitude < -90 || $latitude > 90) {
            throw new InvalidArgumentException("Invalid latitude: {$latitude}");
        }
    }

    private function ensureIsValidLongitude(float $longitude): void
    {
        if ($longitude < -180 || $longitude > 180) {
            throw new InvalidArgumentException("Invalid longitude: {$longitude}");
        }
    }
}
