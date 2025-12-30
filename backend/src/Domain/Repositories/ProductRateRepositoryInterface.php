<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\ProductRate;
use Domain\ValueObjects\UUID;
use DateTimeImmutable;

interface ProductRateRepositoryInterface
{
    public function save(ProductRate $rate): void;
    
    public function findById(UUID $id): ?ProductRate;
    
    /**
     * @return ProductRate[]
     */
    public function findByProductId(UUID $productId): array;
    
    public function findActiveRateForProduct(UUID $productId, DateTimeImmutable $date): ?ProductRate;
    
    public function expireActiveRates(UUID $productId, DateTimeImmutable $effectiveTo): void;
}
