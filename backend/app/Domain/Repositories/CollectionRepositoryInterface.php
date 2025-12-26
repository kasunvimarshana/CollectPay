<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Collection;

/**
 * Collection Repository Interface
 * 
 * Defines the contract for Collection data access operations.
 * Following Dependency Inversion Principle.
 */
interface CollectionRepositoryInterface
{
    /**
     * Find a collection by ID
     */
    public function findById(int $id): ?Collection;

    /**
     * Get all collections with optional filters
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Create a new collection
     */
    public function create(Collection $collection): Collection;

    /**
     * Update an existing collection
     */
    public function update(Collection $collection): Collection;

    /**
     * Delete a collection by ID
     */
    public function delete(int $id): bool;

    /**
     * Get collections by supplier ID
     */
    public function findBySupplier(int $supplierId, ?array $dateRange = null): array;

    /**
     * Get collections by product ID
     */
    public function findByProduct(int $productId, ?array $dateRange = null): array;

    /**
     * Get collections by collector user ID
     */
    public function findByCollector(int $collectorId, ?array $dateRange = null): array;

    /**
     * Get collections within a date range
     */
    public function findByDateRange(\DateTimeInterface $from, \DateTimeInterface $to): array;

    /**
     * Get total quantity collected for a supplier
     */
    public function getTotalQuantityBySupplier(int $supplierId, ?int $productId = null): float;

    /**
     * Get total amount for collections by supplier
     */
    public function getTotalAmountBySupplier(int $supplierId, ?int $productId = null): float;

    /**
     * Get total count of collections
     */
    public function count(array $filters = []): int;

    /**
     * Get aggregated collection data for reporting
     */
    public function getAggregatedData(array $filters = []): array;
}
