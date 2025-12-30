<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Product;
use Domain\ValueObjects\UUID;

interface ProductRepositoryInterface
{
    public function save(Product $product): void;
    
    public function findById(UUID $id): ?Product;
    
    public function findByCode(string $code): ?Product;
    
    /**
     * @return Product[]
     */
    public function findAll(int $page = 1, int $perPage = 30, ?string $search = null): array;
    
    public function count(?string $search = null): int;
    
    public function delete(UUID $id): void;
    
    public function codeExists(string $code, ?UUID $excludeId = null): bool;
}
