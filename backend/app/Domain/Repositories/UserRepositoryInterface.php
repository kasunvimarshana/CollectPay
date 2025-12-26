<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\UserEntity;

/**
 * User Repository Interface
 * 
 * Defines the contract for user data access operations.
 */
interface UserRepositoryInterface
{
    /**
     * Find user by email
     * 
     * @param string $email
     * @return UserEntity|null
     */
    public function findByEmail(string $email): ?UserEntity;

    /**
     * Save a user entity
     * 
     * @param UserEntity $user
     * @return UserEntity
     */
    public function save(UserEntity $user): UserEntity;

    /**
     * Find user by ID
     * 
     * @param int $id
     * @return UserEntity|null
     */
    public function findById(int $id): ?UserEntity;
}
