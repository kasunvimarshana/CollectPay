<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Repositories;

use LedgerFlow\Domain\Entities\Supplier;

/**
 * Supplier Repository Interface
 * 
 * Defines the contract for supplier data persistence operations.
 */
interface SupplierRepositoryInterface
{
    /**
     * Find supplier by ID
     */
    public function findById(int $id): ?Supplier;
    
    /**
     * Find supplier by unique code
     */
    public function findByCode(string $code): ?Supplier;
    
    /**
     * Find all suppliers with pagination
     */
    public function findAll(int $limit = 100, int $offset = 0): array;
    
    /**
     * Find active suppliers with pagination
     */
    public function findActive(int $limit = 100, int $offset = 0): array;
    
    /**
     * Save supplier (insert or update)
     * Returns the saved supplier with updated ID if new
     */
    public function save(Supplier $supplier): Supplier;
    
    /**
     * Delete supplier (soft delete)
     */
    public function delete(int $id): bool;
    
    /**
     * Check if supplier exists by ID
     */
    public function exists(int $id): bool;
    
    /**
     * Check if supplier code exists, optionally excluding a specific supplier ID
     */
    public function codeExists(string $code, ?int $excludeId = null): bool;
}
