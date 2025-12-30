<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Collection;
use DateTimeImmutable;

/**
 * Collection Repository Interface
 */
interface CollectionRepositoryInterface
{
    public function save(Collection $collection): void;
    
    public function findById(string $id): ?Collection;
    
    public function findBySupplierId(
        string $supplierId,
        int $page = 1,
        int $perPage = 20
    ): array;
    
    public function findBySupplierAndDateRange(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): array;
    
    public function findAll(int $page = 1, int $perPage = 20): array;
    
    public function delete(string $id): void;
}
