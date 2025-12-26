<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\ProductEntity;

/**
 * Product Repository Interface
 * 
 * Defines the contract for product data access operations.
 * Part of the Domain layer, independent of infrastructure.
 */
interface ProductRepositoryInterface
{
    /**
     * Find product by ID
     * 
     * @param int $id
     * @return ProductEntity|null
     */
    public function findById(int $id): ?ProductEntity;

    /**
     * Find all products with optional filters
     * 
     * @param array $filters
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Count products with optional filters
     * 
     * @param array $filters
     * @return int
     */
    public function count(array $filters = []): int;

    /**
     * Save a product
     * 
     * @param ProductEntity $product
     * @return ProductEntity
     */
    public function save(ProductEntity $product): ProductEntity;

    /**
     * Update a product
     * 
     * @param ProductEntity $product
     * @return ProductEntity
     */
    public function update(ProductEntity $product): ProductEntity;

    /**
     * Delete a product by ID
     * 
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * Check if a product code exists (excluding a specific ID)
     * 
     * @param string $code
     * @param int|null $excludeId
     * @return bool
     */
    public function codeExists(string $code, ?int $excludeId = null): bool;
}
