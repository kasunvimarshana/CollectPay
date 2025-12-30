<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Product;

/**
 * Product Repository Interface
 */
interface ProductRepositoryInterface
{
    public function findById(int $id): ?Product;
    
    public function findByCode(string $code): ?Product;
    
    public function findAll(array $filters = [], int $page = 1, int $perPage = 50): array;
    
    public function save(Product $product): Product;
    
    public function update(Product $product): Product;
    
    public function delete(int $id): bool;
    
    public function codeExists(string $code, ?int $excludeId = null): bool;
    
    public function count(array $filters = []): int;
}
