<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Supplier;
use Domain\ValueObjects\UUID;

/**
 * Supplier Repository Interface
 * 
 * Defines the contract for supplier persistence
 * Following Repository Pattern and Dependency Inversion Principle
 */
interface SupplierRepositoryInterface
{
    /**
     * Save a supplier (create or update)
     */
    public function save(Supplier $supplier): void;

    /**
     * Find supplier by ID
     */
    public function findById(UUID $id): ?Supplier;

    /**
     * Find supplier by code
     */
    public function findByCode(string $code): ?Supplier;

    /**
     * Find all suppliers with optional filters
     * 
     * @param array $filters ['active' => true, 'search' => 'term']
     * @param int $page
     * @param int $perPage
     * @return array ['data' => Supplier[], 'total' => int]
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Delete a supplier
     */
    public function delete(UUID $id): void;

    /**
     * Check if supplier code exists
     */
    public function codeExists(string $code, ?UUID $excludeId = null): bool;
}
