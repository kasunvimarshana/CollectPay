<?php

namespace Domain\User;

/**
 * User Repository Interface - Port for persistence
 * Follows Repository Pattern and Dependency Inversion Principle
 */
interface UserRepositoryInterface
{
    public function save(User $user): void;

    public function findById(string $id): ?User;

    public function findByEmail(string $email): ?User;

    public function findAll(int $page = 1, int $perPage = 20): array;

    public function delete(string $id): void;

    public function exists(string $id): bool;

    public function emailExists(string $email): bool;

    public function countByRole(string $role): int;
}
