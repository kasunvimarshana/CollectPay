<?php

namespace Domain\Collection;

/**
 * Collection Repository Interface
 */
interface CollectionRepositoryInterface
{
    public function save(Collection $collection): void;

    public function findById(string $id): ?Collection;

    public function findBySupplierId(string $supplierId, int $page = 1, int $perPage = 20): array;

    public function findByCollectedBy(string $userId, int $page = 1, int $perPage = 20): array;

    public function findByStatus(string $status, int $page = 1, int $perPage = 20): array;

    public function findByDateRange(\DateTimeImmutable $from, \DateTimeImmutable $to): array;

    public function findBySyncId(string $syncId): ?Collection;

    public function delete(string $id): void;

    public function getTotalAmountBySupplier(string $supplierId): int;

    public function getStatsByCollector(string $userId): array;
}
