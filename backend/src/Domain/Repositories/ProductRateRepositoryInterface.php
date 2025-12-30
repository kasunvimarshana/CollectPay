<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Repositories;

use DateTimeImmutable;
use LedgerFlow\Domain\Entities\ProductRate;

/**
 * ProductRate Repository Interface
 * 
 * Defines the contract for product rate data persistence operations.
 * Supports versioned rate management and historical queries.
 */
interface ProductRateRepositoryInterface
{
    public function findById(string $id): ?ProductRate;
    
    public function findByProductId(string $productId, int $limit = 100, int $offset = 0): array;
    
    public function findActiveByProductId(string $productId): ?ProductRate;
    
    public function findByProductIdAndDate(string $productId, DateTimeImmutable $date): ?ProductRate;
    
    public function save(ProductRate $rate): ProductRate;
    
    public function update(ProductRate $rate): bool;
    
    public function delete(string $id): bool;
    
    public function exists(string $id): bool;
}
