<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Supplier;

/**
 * Supplier Repository Interface
 * 
 * Defines the contract for Supplier data access operations.
 * Following Dependency Inversion Principle.
 */
interface SupplierRepositoryInterface
{
    /**
     * Find a supplier by ID
     */
    public function findById(int $id): ?Supplier;

    /**
     * Find a supplier by code
     */
    public function findByCode(string $code): ?Supplier;

    /**
     * Get all suppliers with optional filters
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Create a new supplier
     */
    public function create(Supplier $supplier): Supplier;

    /**
     * Update an existing supplier
     */
    public function update(Supplier $supplier): Supplier;

    /**
     * Delete a supplier by ID
     */
    public function delete(int $id): bool;

    /**
     * Check if a supplier exists by code
     */
    public function existsByCode(string $code): bool;

    /**
     * Search suppliers by name or code
     */
    public function search(string $query): array;

    /**
     * Get total count of suppliers
     */
    public function count(array $filters = []): int;

    /**
     * Get active suppliers only
     */
    public function findActive(): array;
}
