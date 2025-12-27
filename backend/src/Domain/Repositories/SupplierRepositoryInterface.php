<?php

declare(strict_types=1);

namespace TrackVault\Domain\Repositories;

use TrackVault\Domain\Entities\Supplier;
use TrackVault\Domain\ValueObjects\SupplierId;

/**
 * Supplier Repository Interface
 */
interface SupplierRepositoryInterface
{
    public function findById(SupplierId $id): ?Supplier;
    
    public function findAll(int $page = 1, int $perPage = 10): array;
    
    public function search(string $query, int $page = 1, int $perPage = 10): array;
    
    public function save(Supplier $supplier): void;
    
    public function delete(SupplierId $id): void;
    
    public function exists(SupplierId $id): bool;
}
