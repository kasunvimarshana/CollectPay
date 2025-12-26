<?php

namespace App\Application\UseCases;

use App\Application\DTOs\RegisterUserDTO;
use App\Domain\Entities\UserEntity;
use App\Domain\Repositories\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

/**
 * Register User Use Case
 * 
 * Handles the business logic for user registration.
 * Follows Single Responsibility Principle.
 */
class RegisterUserUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param RegisterUserDTO $dto
     * @param string|null $requestingUserRole - Role of the user making the request
     * @return UserEntity
     * @throws \InvalidArgumentException
     */
    public function execute(RegisterUserDTO $dto, ?string $requestingUserRole = null): UserEntity
    {
        // Check if email already exists
        $existingUser = $this->userRepository->findByEmail($dto->email);
        if ($existingUser) {
            throw new \InvalidArgumentException('Email already exists');
        }

        // Determine role - only admins can create other admins
        $role = 'collector'; // Default role
        if ($dto->role && $requestingUserRole === 'admin') {
            $role = $dto->role;
        }

        // Create user entity with hashed password
        $user = new UserEntity(
            id: null,
            name: $dto->name,
            email: $dto->email,
            password: Hash::make($dto->password),
            role: $role,
            isActive: true
        );

        // Save and return
        return $this->userRepository->save($user);
    }
}
