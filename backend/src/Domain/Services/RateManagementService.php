<?php

namespace App\Domain\Services;

use App\Domain\Entities\ProductRate;
use App\Domain\Repositories\ProductRateRepositoryInterface;

/**
 * Rate Management Service
 * 
 * Manages product rates with version control and historical immutability.
 * Ensures that historical rates are never modified.
 */
class RateManagementService
{
    private ProductRateRepositoryInterface $rateRepository;

    public function __construct(ProductRateRepositoryInterface $rateRepository)
    {
        $this->rateRepository = $rateRepository;
    }

    /**
     * Create a new rate for a product
     * Automatically deactivates previous rates when the new rate becomes effective
     */
    public function createNewRate(
        int $productId,
        float $rate,
        \DateTimeInterface $effectiveFrom,
        int $createdBy
    ): ProductRate {
        // Deactivate all previous rates that would overlap with the new rate
        $this->rateRepository->deactivatePreviousRates($productId, $effectiveFrom);

        // Create and save the new rate
        $newRate = new ProductRate(
            $productId,
            $rate,
            $effectiveFrom,
            $createdBy,
            null, // No end date initially
            true,
            null,
            1
        );

        return $this->rateRepository->save($newRate);
    }

    /**
     * Get the appropriate rate for a collection at a specific date
     * This ensures historical collections use the correct rate
     */
    public function getRateForDate(int $productId, \DateTimeInterface $date): ?ProductRate
    {
        return $this->rateRepository->findActiveRateForDate($productId, $date);
    }

    /**
     * Get the current active rate for a product
     */
    public function getCurrentRate(int $productId): ?ProductRate
    {
        return $this->rateRepository->findCurrentActiveRate($productId);
    }

    /**
     * Get all historical rates for a product
     */
    public function getRateHistory(int $productId): array
    {
        return $this->rateRepository->findAllForProduct($productId);
    }

    /**
     * Calculate amount based on quantity and the appropriate rate for a date
     */
    public function calculateAmountForDate(
        int $productId,
        float $quantity,
        \DateTimeInterface $date
    ): ?array {
        $rate = $this->getRateForDate($productId, $date);
        
        if (!$rate) {
            return null;
        }

        return [
            'quantity' => $quantity,
            'rate' => $rate->getRate(),
            'rate_id' => $rate->getId(),
            'amount' => $rate->calculateAmount($quantity),
            'effective_from' => $rate->getEffectiveFrom()->format('Y-m-d H:i:s'),
        ];
    }
}
