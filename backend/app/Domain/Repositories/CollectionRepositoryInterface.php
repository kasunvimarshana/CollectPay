<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\CollectionEntity;

/**
 * Collection Repository Interface
 *
 * Defines the contract for Collection persistence operations.
 * Infrastructure layer will provide concrete implementations.
 */
interface CollectionRepositoryInterface
{
    /**
     * Save a collection entity (create or update)
     *
     * @throws \Exception if save fails
     */
    public function save(CollectionEntity $entity): CollectionEntity;

    /**
     * Find a collection by ID
     */
    public function findById(int $id): ?CollectionEntity;

    /**
     * Find collections by supplier
     *
     * @return CollectionEntity[]
     */
    public function findBySupplier(int $supplierId, ?\DateTimeInterface $fromDate = null, ?\DateTimeInterface $toDate = null): array;

    /**
     * Find collections by product
     *
     * @return CollectionEntity[]
     */
    public function findByProduct(int $productId, ?\DateTimeInterface $fromDate = null, ?\DateTimeInterface $toDate = null): array;

    /**
     * Find collections by date
     *
     * @return CollectionEntity[]
     */
    public function findByDate(\DateTimeInterface $date): array;

    /**
     * List all collections with optional filters
     *
     * @return array ['data' => CollectionEntity[], 'total' => int, 'page' => int]
     */
    public function list(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Delete a collection by ID
     */
    public function delete(int $id): bool;

    /**
     * Check if a collection exists
     */
    public function exists(int $id): bool;

    /**
     * Calculate total collections amount for a supplier
     */
    public function getTotalAmountBySupplier(int $supplierId, ?\DateTimeInterface $fromDate = null, ?\DateTimeInterface $toDate = null): float;
}
