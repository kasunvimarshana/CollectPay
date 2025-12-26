<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\ProductRate;

/**
 * Product Rate Repository Interface
 * 
 * Handles versioned product rates with immutability guarantees.
 */
interface ProductRateRepositoryInterface
{
    public function findById(int $id): ?ProductRate;
    
    /**
     * Find the active rate for a product at a specific date
     */
    public function findActiveRateForDate(int $productId, \DateTimeInterface $date): ?ProductRate;
    
    /**
     * Find the current active rate for a product
     */
    public function findCurrentActiveRate(int $productId): ?ProductRate;
    
    /**
     * Get all rates for a product (historical view)
     */
    public function findAllForProduct(int $productId): array;
    
    /**
     * Save a new rate
     */
    public function save(ProductRate $rate): ProductRate;
    
    /**
     * Deactivate old rates when a new rate is created
     */
    public function deactivatePreviousRates(int $productId, \DateTimeInterface $effectiveFrom): void;
}
