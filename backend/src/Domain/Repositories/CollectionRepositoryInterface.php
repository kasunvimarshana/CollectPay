<?php

declare(strict_types=1);

namespace TrackVault\Domain\Repositories;

use TrackVault\Domain\Entities\Collection;
use TrackVault\Domain\ValueObjects\CollectionId;
use TrackVault\Domain\ValueObjects\SupplierId;
use TrackVault\Domain\ValueObjects\ProductId;
use DateTimeImmutable;

/**
 * Collection Repository Interface
 */
interface CollectionRepositoryInterface
{
    public function findById(CollectionId $id): ?Collection;
    
    public function findAll(int $page = 1, int $perPage = 10): array;
    
    public function findBySupplier(SupplierId $supplierId, int $page = 1, int $perPage = 10): array;
    
    public function findByProduct(ProductId $productId, int $page = 1, int $perPage = 10): array;
    
    public function findByDateRange(
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate,
        int $page = 1,
        int $perPage = 10
    ): array;
    
    public function save(Collection $collection): void;
    
    public function delete(CollectionId $id): void;
    
    public function exists(CollectionId $id): bool;
}
