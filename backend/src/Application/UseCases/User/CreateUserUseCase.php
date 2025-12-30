<?php

namespace App\Application\UseCases\User;

use App\Domain\Entities\User;
use App\Domain\Repositories\UserRepositoryInterface;

/**
 * Create User Use Case
 * 
 * Implements business logic for creating a new user.
 * Follows Single Responsibility Principle.
 */
class CreateUserUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function execute(
        string $name,
        string $email,
        string $password,
        string $role = 'collector',
        array $permissions = []
    ): User {
        // Validate email uniqueness
        if ($this->userRepository->emailExists($email)) {
            throw new \DomainException('Email already exists');
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_ARGON2ID);

        // Create user entity
        $user = new User(
            null,
            $name,
            $email,
            $hashedPassword,
            $role,
            $permissions
        );

        // Persist user
        return $this->userRepository->save($user);
    }
}
