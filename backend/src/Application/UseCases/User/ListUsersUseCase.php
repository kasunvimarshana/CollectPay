<?php

declare(strict_types=1);

namespace Application\UseCases\User;

use Domain\Repositories\UserRepositoryInterface;

/**
 * Use Case: List all users
 * 
 * This use case retrieves a paginated list of users.
 */
final class ListUsersUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param int $page
     * @param int $perPage
     * @param array $filters
     * @return array
     */
    public function execute(int $page = 1, int $perPage = 15, array $filters = []): array
    {
        return $this->userRepository->findAll($page, $perPage, $filters);
    }
}
