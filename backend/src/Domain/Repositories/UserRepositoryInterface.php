<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\User;

/**
 * User Repository Interface
 * 
 * Defines the contract for user data access operations.
 * Infrastructure layer will provide the concrete implementation.
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
    public function findAll(array $filters = [], int $page = 1, int $perPage = 20): array;

    /**
     * Save a new user
     */
    public function save(User $user): User;

    /**
     * Update an existing user
     */
    public function update(User $user): User;

    /**
     * Delete a user
     */
    public function delete(int $id): bool;

    /**
     * Check if email already exists
     */
    public function emailExists(string $email): bool;
}
