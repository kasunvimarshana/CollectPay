<?php

declare(strict_types=1);

namespace Application\UseCases\User;

use Domain\Repositories\UserRepositoryInterface;

/**
 * Use Case: Delete a user
 * 
 * This use case handles soft deletion of users.
 */
final class DeleteUserUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $userId
     * @return bool
     * @throws \InvalidArgumentException
     */
    public function execute(string $userId): bool
    {
        // Find existing user
        $user = $this->userRepository->findById($userId);
        
        if (!$user) {
            throw new \InvalidArgumentException("User with ID {$userId} not found");
        }

        // Delete user
        return $this->userRepository->delete($userId);
    }
}
