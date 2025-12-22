<?php

namespace Domain\Supplier;

/**
 * Supplier Repository Interface
 */
interface SupplierRepositoryInterface
{
    public function save(Supplier $supplier): void;

    public function findById(string $id): ?Supplier;

    public function findAll(int $page = 1, int $perPage = 20): array;

    public function findByCreatedBy(string $userId, int $page = 1, int $perPage = 20): array;

    public function findActiveSuppliers(int $page = 1, int $perPage = 20): array;

    public function searchByName(string $name, int $page = 1, int $perPage = 20): array;

    public function delete(string $id): void;

    public function exists(string $id): bool;

    public function count(): int;
}
