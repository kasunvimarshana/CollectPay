<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Product;

/**
 * Product Repository Interface
 */
interface ProductRepositoryInterface
{
    public function save(Product $product): void;
    
    public function findById(string $id): ?Product;
    
    public function findByCode(string $code): ?Product;
    
    public function findAll(int $page = 1, int $perPage = 20): array;
    
    public function delete(string $id): void;
    
    public function exists(string $id): bool;
}
