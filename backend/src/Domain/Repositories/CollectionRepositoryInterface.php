<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Collection;

/**
 * Collection Repository Interface
 */
interface CollectionRepositoryInterface
{
    public function findById(int $id): ?Collection;
    public function findBySyncId(string $syncId): ?Collection;
    public function findAll(array $filters = [], int $page = 1, int $perPage = 20): array;
    
    /**
     * Find collections by supplier within a date range
     */
    public function findBySupplierAndDateRange(
        int $supplierId,
        \DateTimeInterface $from,
        \DateTimeInterface $to
    ): array;
    
    /**
     * Calculate total collected amount for a supplier
     */
    public function getTotalAmountForSupplier(int $supplierId, ?\DateTimeInterface $upToDate = null): float;
    
    public function save(Collection $collection): Collection;
    public function update(Collection $collection): Collection;
    public function delete(int $id): bool;
}
