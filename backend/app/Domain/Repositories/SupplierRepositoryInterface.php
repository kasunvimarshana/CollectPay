<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Supplier;

/**
 * Supplier Repository Interface
 */
interface SupplierRepositoryInterface
{
    public function findById(int $id): ?Supplier;
    
    public function findByCode(string $code): ?Supplier;
    
    public function findAll(array $filters = [], int $page = 1, int $perPage = 50): array;
    
    public function save(Supplier $supplier): Supplier;
    
    public function update(Supplier $supplier): Supplier;
    
    public function delete(int $id): bool;
    
    public function codeExists(string $code, ?int $excludeId = null): bool;
    
    public function count(array $filters = []): int;
}
