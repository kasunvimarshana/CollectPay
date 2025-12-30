<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Supplier;

/**
 * Supplier Repository Interface
 */
interface SupplierRepositoryInterface
{
    public function findById(int $id): ?Supplier;

    public function findAll(int $page = 1, int $perPage = 15): array;

    public function save(Supplier $supplier): Supplier;

    public function delete(int $id): bool;

    public function search(string $query): array;
}
