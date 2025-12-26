<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\User;

/**
 * User Repository Interface
 * 
 * Defines the contract for User data access operations.
 * Following Dependency Inversion Principle - domain defines the interface,
 * infrastructure provides the implementation.
 */
interface UserRepositoryInterface
{
    /**
     * Find a user by ID
     */
    public function findById(int $id): ?User;

    /**
     * Find a user by email
     */
    public function findByEmail(string $email): ?User;

    /**
     * Get all users with optional filters
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Create a new user
     */
    public function create(User $user): User;

    /**
     * Update an existing user
     */
    public function update(User $user): User;

    /**
     * Delete a user by ID
     */
    public function delete(int $id): bool;

    /**
     * Check if a user exists by email
     */
    public function existsByEmail(string $email): bool;

    /**
     * Find users by role
     */
    public function findByRole(string $role): array;

    /**
     * Get total count of users
     */
    public function count(array $filters = []): int;
}
