<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Supplier;

/**
 * Supplier Repository Interface
 */
interface SupplierRepositoryInterface
{
    public function save(Supplier $supplier): void;
    
    public function findById(string $id): ?Supplier;
    
    public function findByCode(string $code): ?Supplier;
    
    public function findAll(int $page = 1, int $perPage = 20): array;
    
    public function delete(string $id): void;
    
    public function exists(string $id): bool;
}
