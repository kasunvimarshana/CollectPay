<?php

declare(strict_types=1);

namespace TrackVault\Domain\Repositories;

use TrackVault\Domain\Entities\Product;
use TrackVault\Domain\ValueObjects\ProductId;

/**
 * Product Repository Interface
 */
interface ProductRepositoryInterface
{
    public function findById(ProductId $id): ?Product;
    
    public function findAll(int $page = 1, int $perPage = 10): array;
    
    public function search(string $query, int $page = 1, int $perPage = 10): array;
    
    public function save(Product $product): void;
    
    public function delete(ProductId $id): void;
    
    public function exists(ProductId $id): bool;
}
