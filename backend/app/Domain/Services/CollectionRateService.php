<?php

namespace App\Domain\Services;

use App\Domain\Entities\CollectionEntity;
use App\Domain\ValueObjects\Money;

/**
 * Collection Rate Service
 * 
 * Domain service for handling rate application in collections.
 * Encapsulates complex business logic for rate selection and application.
 */
class CollectionRateService
{
    /**
     * Calculate collection amount
     * 
     * @param float $quantity The quantity collected
     * @param float $rate The rate per unit
     * @return Money The calculated amount
     */
    public function calculateAmount(float $quantity, float $rate, string $currency = 'USD'): Money
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than zero');
        }

        if ($rate < 0) {
            throw new \InvalidArgumentException('Rate cannot be negative');
        }

        $amount = $quantity * $rate;
        return new Money($amount, $currency);
    }

    /**
     * Validate rate for a given date
     * 
     * Ensures the rate is valid for the collection date.
     * 
     * @param \DateTimeImmutable $collectionDate
     * @param \DateTimeImmutable $rateEffectiveDate
     * @param \DateTimeImmutable|null $rateEndDate
     * @return bool
     */
    public function isRateValidForDate(
        \DateTimeImmutable $collectionDate,
        \DateTimeImmutable $rateEffectiveDate,
        ?\DateTimeImmutable $rateEndDate = null
    ): bool {
        // Collection date must be on or after the rate effective date
        if ($collectionDate < $rateEffectiveDate) {
            return false;
        }

        // If there's an end date, collection must be on or before it
        if ($rateEndDate !== null && $collectionDate > $rateEndDate) {
            return false;
        }

        return true;
    }

    /**
     * Calculate total collections amount for multiple collection entities
     * 
     * @param array $collections Array of CollectionEntity objects
     * @param string $currency Currency code
     * @return Money Total amount
     */
    public function calculateTotalCollectionsAmount(array $collections, string $currency = 'USD'): Money
    {
        $total = new Money(0, $currency);

        foreach ($collections as $collection) {
            if (!$collection instanceof CollectionEntity) {
                throw new \InvalidArgumentException('All items must be CollectionEntity instances');
            }

            $collectionAmount = $collection->getTotalAmountAsMoney($currency);
            $total = $total->add($collectionAmount);
        }

        return $total;
    }

    /**
     * Calculate average rate from collections
     * 
     * @param array $collections Array of CollectionEntity objects
     * @return float Average rate
     */
    public function calculateAverageRate(array $collections): float
    {
        if (empty($collections)) {
            return 0.0;
        }

        $totalQuantity = 0.0;
        $totalAmount = 0.0;

        foreach ($collections as $collection) {
            if (!$collection instanceof CollectionEntity) {
                throw new \InvalidArgumentException('All items must be CollectionEntity instances');
            }

            $totalQuantity += $collection->getQuantity();
            $totalAmount += $collection->getTotalAmount();
        }

        if ($totalQuantity == 0) {
            return 0.0;
        }

        return round($totalAmount / $totalQuantity, 2);
    }

    /**
     * Group collections by supplier
     * 
     * @param array $collections Array of CollectionEntity objects
     * @return array Grouped collections [supplierId => [CollectionEntity, ...]]
     */
    public function groupBySupplier(array $collections): array
    {
        $grouped = [];

        foreach ($collections as $collection) {
            if (!$collection instanceof CollectionEntity) {
                throw new \InvalidArgumentException('All items must be CollectionEntity instances');
            }

            $supplierId = $collection->getSupplierId();
            
            if (!isset($grouped[$supplierId])) {
                $grouped[$supplierId] = [];
            }

            $grouped[$supplierId][] = $collection;
        }

        return $grouped;
    }
}
