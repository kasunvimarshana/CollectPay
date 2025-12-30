<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\User;

/**
 * User Repository Interface
 * 
 * Defines the contract for user persistence operations.
 * Infrastructure layer will implement this interface.
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
     * Get all users with optional filtering
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 50): array;

    /**
     * Save a new user
     */
    public function save(User $user): User;

    /**
     * Update existing user
     */
    public function update(User $user): User;

    /**
     * Delete user
     */
    public function delete(int $id): bool;

    /**
     * Check if email exists
     */
    public function emailExists(string $email, ?int $excludeId = null): bool;

    /**
     * Get total count of users
     */
    public function count(array $filters = []): int;
}
