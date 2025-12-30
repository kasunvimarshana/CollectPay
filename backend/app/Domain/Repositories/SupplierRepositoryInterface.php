<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\SupplierEntity;

/**
 * Supplier Repository Interface
 *
 * Defines the contract for supplier persistence operations.
 * This interface belongs to the Domain layer and is implemented in the Infrastructure layer.
 * This follows the Dependency Inversion Principle (SOLID).
 */
interface SupplierRepositoryInterface
{
    /**
     * Find a supplier by ID
     */
    public function findById(int $id): ?SupplierEntity;

    /**
     * Find a supplier by code
     */
    public function findByCode(string $code): ?SupplierEntity;

    /**
     * Get all suppliers with optional filters
     */
    public function getAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Save a supplier (create or update)
     */
    public function save(SupplierEntity $supplier): SupplierEntity;

    /**
     * Delete a supplier
     */
    public function delete(int $id): bool;

    /**
     * Check if a supplier exists by ID
     */
    public function exists(int $id): bool;

    /**
     * Check if a supplier code is unique
     */
    public function isCodeUnique(string $code, ?int $excludeId = null): bool;

    /**
     * Get supplier balance information
     */
    public function getBalance(int $id): array;

    /**
     * Get supplier collections
     */
    public function getCollections(int $id, array $filters = []): array;

    /**
     * Get supplier payments
     */
    public function getPayments(int $id, array $filters = []): array;
}
