<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\ProductEntity;

/**
 * Product Repository Interface
 *
 * Defines the contract for Product persistence operations.
 * Infrastructure layer will provide concrete implementations.
 */
interface ProductRepositoryInterface
{
    /**
     * Save a product entity (create or update)
     *
     * @throws \Exception if save fails
     */
    public function save(ProductEntity $entity): ProductEntity;

    /**
     * Find a product by ID
     */
    public function findById(int $id): ?ProductEntity;

    /**
     * Find a product by code
     */
    public function findByCode(string $code): ?ProductEntity;

    /**
     * List all products with optional filters
     *
     * @return array ['data' => ProductEntity[], 'total' => int, 'page' => int]
     */
    public function list(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Delete a product by ID
     */
    public function delete(int $id): bool;

    /**
     * Check if a product code is unique (excluding a specific ID)
     */
    public function isCodeUnique(string $code, ?int $excludeId = null): bool;

    /**
     * Check if a product exists
     */
    public function exists(int $id): bool;

    /**
     * Get all active products
     *
     * @return ProductEntity[]
     */
    public function getActive(): array;
}
