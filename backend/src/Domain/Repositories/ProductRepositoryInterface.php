<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Repositories;

use LedgerFlow\Domain\Entities\Product;

/**
 * Product Repository Interface
 * 
 * Defines the contract for product data persistence operations.
 */
interface ProductRepositoryInterface
{
    public function findById(string $id): ?Product;
    
    public function findByCode(string $code): ?Product;
    
    public function findAll(int $limit = 100, int $offset = 0): array;
    
    public function findActive(int $limit = 100, int $offset = 0): array;
    
    public function save(Product $product): Product;
    
    public function update(Product $product): bool;
    
    public function delete(string $id): bool;
    
    public function exists(string $id): bool;
    
    public function codeExists(string $code, ?string $excludeId = null): bool;
}
