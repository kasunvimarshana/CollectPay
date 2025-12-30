<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Collection;

/**
 * Collection Repository Interface
 */
interface CollectionRepositoryInterface
{
    public function findById(int $id): ?Collection;

    public function findAll(int $page = 1, int $perPage = 15): array;

    public function findBySupplier(int $supplierId, ?int $page = 1, ?int $perPage = 15): array;

    public function findByProduct(int $productId, ?int $page = 1, ?int $perPage = 15): array;

    public function save(Collection $collection): Collection;

    public function delete(int $id): bool;

    public function getTotalCollectionValueBySupplier(int $supplierId): float;
}
