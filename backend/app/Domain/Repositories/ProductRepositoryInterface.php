<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Product;
use App\Domain\Entities\ProductRate;

/**
 * Product Repository Interface
 * 
 * Defines the contract for Product and ProductRate data access operations.
 * Following Dependency Inversion Principle.
 */
interface ProductRepositoryInterface
{
    /**
     * Find a product by ID
     */
    public function findById(int $id): ?Product;

    /**
     * Find a product by code
     */
    public function findByCode(string $code): ?Product;

    /**
     * Get all products with optional filters
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Create a new product
     */
    public function create(Product $product): Product;

    /**
     * Update an existing product
     */
    public function update(Product $product): Product;

    /**
     * Delete a product by ID
     */
    public function delete(int $id): bool;

    /**
     * Check if a product exists by code
     */
    public function existsByCode(string $code): bool;

    /**
     * Get active products only
     */
    public function findActive(): array;

    /**
     * Get total count of products
     */
    public function count(array $filters = []): int;

    /**
     * Get effective rate for a product at a specific date
     */
    public function getEffectiveRate(int $productId, \DateTimeInterface $date): ?ProductRate;

    /**
     * Get rate history for a product
     */
    public function getRateHistory(int $productId): array;

    /**
     * Create a new product rate
     */
    public function createRate(ProductRate $rate): ProductRate;

    /**
     * Get current active rate for a product
     */
    public function getCurrentRate(int $productId): ?ProductRate;

    /**
     * Expire old rates when a new rate becomes effective
     */
    public function expireOldRates(int $productId, \DateTimeInterface $effectiveFrom): void;
}
