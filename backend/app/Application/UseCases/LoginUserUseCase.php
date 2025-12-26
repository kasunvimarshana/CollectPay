<?php

namespace App\Application\UseCases;

use App\Application\DTOs\LoginUserDTO;
use App\Domain\Entities\UserEntity;
use App\Domain\Repositories\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Login User Use Case
 * 
 * Handles the business logic for user authentication.
 * Follows Single Responsibility Principle.
 */
class LoginUserUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param LoginUserDTO $dto
     * @return UserEntity
     * @throws ValidationException
     */
    public function execute(LoginUserDTO $dto): UserEntity
    {
        // Find user by email
        $user = $this->userRepository->findByEmail($dto->email);

        // Verify credentials
        if (!$user || !Hash::check($dto->password, $user->getPassword())) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is active
        if (!$user->isActive()) {
            throw ValidationException::withMessages([
                'email' => ['This account is inactive.'],
            ]);
        }

        return $user;
    }
}
