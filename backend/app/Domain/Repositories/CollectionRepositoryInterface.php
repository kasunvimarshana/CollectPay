<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Collection;
use DateTimeImmutable;

interface CollectionRepositoryInterface
{
    public function findById(string $id): ?Collection;
    
    public function findByIdempotencyKey(string $key): ?Collection;
    
    public function findAll(int $page = 1, int $perPage = 50): array;
    
    public function findBySupplierId(string $supplierId, int $page = 1, int $perPage = 50): array;
    
    public function findBySupplierAndDateRange(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): array;
    
    public function save(Collection $collection): bool;
    
    public function saveBatch(array $collections): bool;
    
    public function delete(string $id): bool;
    
    public function getUpdatedSince(string $timestamp): array;
    
    public function getTotalQuantityBySupplierAndProduct(
        string $supplierId,
        string $productId,
        ?DateTimeImmutable $startDate = null,
        ?DateTimeImmutable $endDate = null
    ): float;
}
