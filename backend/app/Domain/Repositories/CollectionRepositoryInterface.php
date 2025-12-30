<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Collection;
use DateTime;

/**
 * Collection Repository Interface
 */
interface CollectionRepositoryInterface
{
    public function findById(int $id): ?Collection;
    
    public function findBySupplierId(int $supplierId, array $filters = []): array;
    
    public function findByProductId(int $productId, array $filters = []): array;
    
    public function findByDateRange(DateTime $from, DateTime $to, array $filters = []): array;
    
    public function findAll(array $filters = [], int $page = 1, int $perPage = 50): array;
    
    public function save(Collection $collection): Collection;
    
    public function update(Collection $collection): Collection;
    
    public function delete(int $id): bool;
    
    public function count(array $filters = []): int;
    
    public function getTotalQuantityForSupplier(int $supplierId, ?int $productId = null): array;
}
