<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Product;

interface ProductRepositoryInterface
{
    public function findById(string $id): ?Product;
    
    public function findByCode(string $code): ?Product;
    
    public function findAll(int $page = 1, int $perPage = 50): array;
    
    public function save(Product $product): bool;
    
    public function delete(string $id): bool;
    
    public function existsByCode(string $code): bool;
    
    public function getUpdatedSince(string $timestamp): array;
}
