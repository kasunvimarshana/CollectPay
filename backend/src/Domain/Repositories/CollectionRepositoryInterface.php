<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Repositories;

use DateTimeImmutable;
use LedgerFlow\Domain\Entities\Collection;

/**
 * Collection Repository Interface
 * 
 * Defines the contract for collection data persistence operations.
 * Supports multi-user, multi-device sync operations.
 */
interface CollectionRepositoryInterface
{
    public function findById(string $id): ?Collection;
    
    public function findAll(int $limit = 100, int $offset = 0): array;
    
    public function findBySupplierId(string $supplierId, int $limit = 100, int $offset = 0): array;
    
    public function findByProductId(string $productId, int $limit = 100, int $offset = 0): array;
    
    public function findByUserId(string $userId, int $limit = 100, int $offset = 0): array;
    
    public function findByDateRange(
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate,
        int $limit = 100,
        int $offset = 0
    ): array;
    
    public function findBySupplierAndDateRange(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): array;
    
    public function save(Collection $collection): Collection;
    
    public function update(Collection $collection): bool;
    
    public function delete(string $id): bool;
    
    public function exists(string $id): bool;
    
    public function calculateTotalBySupplier(string $supplierId): float;
    
    public function calculateTotalBySupplierAndDateRange(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): float;
}
