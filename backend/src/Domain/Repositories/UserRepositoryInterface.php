<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Repositories;

use LedgerFlow\Domain\Entities\User;

/**
 * User Repository Interface
 * 
 * Defines the contract for user data persistence operations.
 * Follows the Repository pattern for data access abstraction.
 */
interface UserRepositoryInterface
{
    /**
     * Find user by ID
     */
    public function findById(int $id): ?User;
    
    /**
     * Find user by email address
     */
    public function findByEmail(string $email): ?User;
    
    /**
     * Find all users with pagination
     */
    public function findAll(int $limit = 100, int $offset = 0): array;
    
    /**
     * Find users by role with pagination
     */
    public function findByRole(string $role, int $limit = 100, int $offset = 0): array;
    
    /**
     * Save user (insert or update)
     * Returns the saved user with updated ID if new
     */
    public function save(User $user): User;
    
    /**
     * Delete user (soft delete)
     */
    public function delete(int $id): bool;
    
    /**
     * Check if user exists by ID
     */
    public function exists(int $id): bool;
    
    /**
     * Check if email exists, optionally excluding a specific user ID
     */
    public function emailExists(string $email, ?int $excludeId = null): bool;
}
