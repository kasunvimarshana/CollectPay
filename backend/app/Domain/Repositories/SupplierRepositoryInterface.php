<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Supplier;

interface SupplierRepositoryInterface
{
    public function findById(string $id): ?Supplier;
    
    public function findByCode(string $code): ?Supplier;
    
    public function findAll(int $page = 1, int $perPage = 50): array;
    
    public function findByUserId(string $userId, int $page = 1, int $perPage = 50): array;
    
    public function save(Supplier $supplier): bool;
    
    public function delete(string $id): bool;
    
    public function existsByCode(string $code): bool;
    
    public function getUpdatedSince(string $timestamp): array;
}
