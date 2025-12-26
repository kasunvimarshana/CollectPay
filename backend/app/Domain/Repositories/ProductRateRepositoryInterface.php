<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\ProductRateEntity;

/**
 * ProductRate Repository Interface
 * 
 * Defines the contract for product rate data access operations.
 * Part of the Domain layer, independent of infrastructure.
 */
interface ProductRateRepositoryInterface
{
    /**
     * Find product rate by ID
     * 
     * @param int $id
     * @return ProductRateEntity|null
     */
    public function findById(int $id): ?ProductRateEntity;

    /**
     * Find all product rates with optional filters
     * 
     * @param array $filters
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Count product rates with optional filters
     * 
     * @param array $filters
     * @return int
     */
    public function count(array $filters = []): int;

    /**
     * Save a product rate
     * 
     * @param ProductRateEntity $rate
     * @return ProductRateEntity
     */
    public function save(ProductRateEntity $rate): ProductRateEntity;

    /**
     * Update a product rate
     * 
     * @param ProductRateEntity $rate
     * @return ProductRateEntity
     */
    public function update(ProductRateEntity $rate): ProductRateEntity;

    /**
     * Delete a product rate by ID
     * 
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * Find current rate for product, unit, and date
     * 
     * @param int $productId
     * @param string $unit
     * @param string $date
     * @return ProductRateEntity|null
     */
    public function findCurrentRate(int $productId, string $unit, string $date): ?ProductRateEntity;
}
