<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\SupplierEntity;

/**
 * Supplier Repository Interface
 * 
 * Defines contract for supplier data access.
 * Implementation details are in the Infrastructure layer.
 */
interface SupplierRepositoryInterface
{
    /**
     * Find supplier by ID
     */
    public function findById(int $id): ?SupplierEntity;

    /**
     * Find supplier by code
     */
    public function findByCode(string $code): ?SupplierEntity;

    /**
     * Get all suppliers with optional filters
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Save supplier (create or update)
     */
    public function save(SupplierEntity $supplier): SupplierEntity;

    /**
     * Delete supplier
     */
    public function delete(int $id): bool;

    /**
     * Check if code exists
     */
    public function codeExists(string $code, ?int $excludeId = null): bool;

    /**
     * Get total count with optional filters
     */
    public function count(array $filters = []): int;
}
