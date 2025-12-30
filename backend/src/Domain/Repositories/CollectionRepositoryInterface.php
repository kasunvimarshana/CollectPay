<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Collection;
use DateTimeImmutable;

/**
 * Collection Repository Interface
 * 
 * Defines the contract for collection persistence operations.
 */
interface CollectionRepositoryInterface
{
    public function findById(string $id): ?Collection;
    
    public function findAll(int $page = 1, int $perPage = 20, array $filters = []): array;
    
    public function findBySupplier(string $supplierId, int $page = 1, int $perPage = 20): array;
    
    public function findBySupplierId(
        string $supplierId,
        ?DateTimeImmutable $startDate = null,
        ?DateTimeImmutable $endDate = null
    ): array;
    
    public function findByProduct(string $productId, int $page = 1, int $perPage = 20): array;
    
    public function findByDateRange(
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate,
        ?string $supplierId = null,
        ?string $productId = null
    ): array;
    
    public function save(Collection $collection): Collection;
    
    public function delete(string $id): bool;
    
    public function exists(string $id): bool;
}
