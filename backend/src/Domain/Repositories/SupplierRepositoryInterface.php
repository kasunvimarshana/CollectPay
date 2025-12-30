<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Supplier;

/**
 * Supplier Repository Interface
 * 
 * Defines the contract for supplier persistence operations.
 */
interface SupplierRepositoryInterface
{
    public function findById(string $id): ?Supplier;
    
    public function findAll(int $page = 1, int $perPage = 20, array $filters = []): array;
    
    public function findActive(): array;
    
    public function save(Supplier $supplier): Supplier;
    
    public function delete(string $id): bool;
    
    public function exists(string $id): bool;
}
