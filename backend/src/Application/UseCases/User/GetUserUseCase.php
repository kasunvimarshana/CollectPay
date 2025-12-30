<?php

declare(strict_types=1);

namespace Application\UseCases\User;

use Domain\Entities\User;
use Domain\Repositories\UserRepositoryInterface;

/**
 * Use Case: Get user by ID
 * 
 * This use case retrieves a single user by their identifier.
 */
final class GetUserUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $userId
     * @return User
     * @throws \InvalidArgumentException
     */
    public function execute(string $userId): User
    {
        $user = $this->userRepository->findById($userId);
        
        if (!$user) {
            throw new \InvalidArgumentException("User with ID {$userId} not found");
        }

        return $user;
    }
}
