<?php

declare(strict_types=1);

namespace LedgerFlow\Application\UseCases;

use LedgerFlow\Domain\Entities\User;
use LedgerFlow\Domain\Repositories\UserRepositoryInterface;

/**
 * Create User Use Case
 * 
 * Handles user creation with proper validation and business rules.
 * Follows Clean Architecture principles - independent of frameworks.
 */
class CreateUser
{
    private UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Execute the use case to create a new user
     * 
     * @param array $data User data including name, email, password, and optional role
     * @return User The created user entity
     * @throws \InvalidArgumentException If validation fails
     */
    public function execute(array $data): User
    {
        // Validate input
        $this->validate($data);

        // Check if email already exists
        if ($this->userRepository->emailExists($data['email'])) {
            throw new \InvalidArgumentException('Email already exists');
        }

        // Hash password
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);

        // Create user entity with correct parameter order: name, email, passwordHash, role, isActive
        $user = new User(
            $data['name'],
            $data['email'],
            $passwordHash,
            $data['role'] ?? 'collector',
            true  // isActive defaults to true for new users
        );

        // Save to repository and return with generated ID
        return $this->userRepository->save($user);
    }

    /**
     * Validate user input data
     * 
     * @param array $data User data to validate
     * @throws \InvalidArgumentException If validation fails
     */
    private function validate(array $data): void
    {
        if (empty($data['name']) || !is_string($data['name'])) {
            throw new \InvalidArgumentException('Name is required and must be a string');
        }

        if (strlen($data['name']) < 2 || strlen($data['name']) > 255) {
            throw new \InvalidArgumentException('Name must be between 2 and 255 characters');
        }

        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Valid email is required');
        }

        if (empty($data['password']) || !is_string($data['password'])) {
            throw new \InvalidArgumentException('Password is required');
        }

        if (strlen($data['password']) < 8) {
            throw new \InvalidArgumentException('Password must be at least 8 characters');
        }

        if (isset($data['role']) && !in_array($data['role'], ['admin', 'manager', 'collector', 'viewer'], true)) {
            throw new \InvalidArgumentException('Invalid role. Must be one of: admin, manager, collector, viewer');
        }
    }
}
