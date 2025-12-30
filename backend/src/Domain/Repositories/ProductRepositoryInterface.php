<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Product;

/**
 * Product Repository Interface
 */
interface ProductRepositoryInterface
{
    public function findById(int $id): ?Product;

    public function findAll(int $page = 1, int $perPage = 15): array;

    public function save(Product $product): Product;

    public function delete(int $id): bool;

    public function getRateHistory(int $productId): array;

    public function saveRateVersion(int $productId, float $rate, string $unit, \DateTimeInterface $effectiveFrom): bool;
}
