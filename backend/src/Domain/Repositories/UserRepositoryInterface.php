<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\User;

/**
 * User Repository Interface
 * 
 * Defines the contract for user persistence operations.
 * Implementations should handle data storage/retrieval.
 */
interface UserRepositoryInterface
{
    /**
     * Find user by ID
     */
    public function findById(int $id): ?User;

    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?User;

    /**
     * Get all users with pagination
     */
    public function findAll(int $page = 1, int $perPage = 15): array;

    /**
     * Save a user (create or update)
     */
    public function save(User $user): User;

    /**
     * Delete a user
     */
    public function delete(int $id): bool;

    /**
     * Check if email exists
     */
    public function emailExists(string $email, ?int $excludeId = null): bool;
}
