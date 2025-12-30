<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Rate;
use DateTimeImmutable;

/**
 * Rate Repository Interface
 */
interface RateRepositoryInterface
{
    public function save(Rate $rate): void;
    
    public function findById(string $id): ?Rate;
    
    public function findByProductId(string $productId): array;
    
    public function findEffectiveRateForProduct(
        string $productId,
        DateTimeImmutable $date
    ): ?Rate;
    
    public function findLatestRateForProduct(string $productId): ?Rate;
    
    public function findAll(int $page = 1, int $perPage = 20): array;
}
