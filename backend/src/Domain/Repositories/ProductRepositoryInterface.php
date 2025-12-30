<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Product;

/**
 * Product Repository Interface
 * 
 * Defines the contract for product persistence operations.
 */
interface ProductRepositoryInterface
{
    public function findById(string $id): ?Product;
    
    public function findAll(int $page = 1, int $perPage = 20, array $filters = []): array;
    
    public function findActive(): array;
    
    public function save(Product $product): Product;
    
    public function delete(string $id): bool;
    
    public function exists(string $id): bool;
}
