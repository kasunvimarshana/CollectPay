<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\ProductRateEntity;

/**
 * ProductRate Repository Interface
 *
 * Defines the contract for ProductRate persistence operations.
 * Infrastructure layer will provide concrete implementations.
 */
interface ProductRateRepositoryInterface
{
    /**
     * Save a product rate entity (create or update)
     *
     * @throws \Exception if save fails
     */
    public function save(ProductRateEntity $entity): ProductRateEntity;

    /**
     * Find a product rate by ID
     */
    public function findById(int $id): ?ProductRateEntity;

    /**
     * Get all rates for a product
     *
     * @return ProductRateEntity[]
     */
    public function findByProduct(int $productId, bool $activeOnly = false): array;

    /**
     * Get the current effective rate for a product on a specific date and unit
     */
    public function getCurrentRate(int $productId, \DateTimeInterface $date, string $unit): ?ProductRateEntity;

    /**
     * List all product rates with optional filters
     *
     * @return array ['data' => ProductRateEntity[], 'total' => int, 'page' => int]
     */
    public function list(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Delete a product rate by ID
     */
    public function delete(int $id): bool;

    /**
     * Check if a product rate exists
     */
    public function exists(int $id): bool;

    /**
     * Deactivate all rates for a product except the specified one
     */
    public function deactivateOtherRates(int $productId, int $exceptRateId): void;
}
