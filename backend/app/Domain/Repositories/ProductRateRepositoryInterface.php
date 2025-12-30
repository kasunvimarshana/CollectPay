<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\ProductRate;
use DateTime;

/**
 * ProductRate Repository Interface
 */
interface ProductRateRepositoryInterface
{
    public function findById(int $id): ?ProductRate;
    
    public function findByProductId(int $productId): array;
    
    public function findActiveRateForProduct(int $productId, DateTime $date): ?ProductRate;
    
    public function findLatestRateForProduct(int $productId): ?ProductRate;
    
    public function save(ProductRate $rate): ProductRate;
    
    public function update(ProductRate $rate): ProductRate;
    
    public function getNextVersion(int $productId): int;
}
