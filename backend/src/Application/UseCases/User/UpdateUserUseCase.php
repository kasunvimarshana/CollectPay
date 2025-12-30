<?php

declare(strict_types=1);

namespace Application\UseCases\User;

use Application\DTOs\UpdateUserDTO;
use Domain\Entities\User;
use Domain\Repositories\UserRepositoryInterface;
use Domain\ValueObjects\Email;

/**
 * Use Case: Update an existing user
 * 
 * This use case handles updating user information.
 * It follows the Single Responsibility Principle by focusing only on user updates.
 */
final class UpdateUserUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $userId
     * @param UpdateUserDTO $dto
     * @return User
     * @throws \InvalidArgumentException
     */
    public function execute(string $userId, UpdateUserDTO $dto): User
    {
        // Find existing user
        $user = $this->userRepository->findById($userId);
        
        if (!$user) {
            throw new \InvalidArgumentException("User with ID {$userId} not found");
        }

        // Update name if provided
        if ($dto->name !== null) {
            $user->updateName($dto->name);
        }

        // Update email if provided
        if ($dto->email !== null) {
            $email = new Email($dto->email);
            
            // Check if email is already taken by another user
            $existingUser = $this->userRepository->findByEmail($email->value());
            if ($existingUser && $existingUser->id() !== $userId) {
                throw new \InvalidArgumentException("Email {$email->value()} is already taken");
            }
            
            $user->updateEmail($email);
        }

        // Update password if provided
        if ($dto->password !== null) {
            $hashedPassword = password_hash($dto->password, PASSWORD_BCRYPT);
            $user->updatePassword($hashedPassword);
        }

        // Update roles if provided
        if ($dto->roles !== null) {
            $user->assignRoles($dto->roles);
        }

        // Update active status if provided
        if ($dto->isActive !== null) {
            if ($dto->isActive) {
                $user->activate();
            } else {
                $user->deactivate();
            }
        }

        // Persist changes
        return $this->userRepository->save($user);
    }
}
