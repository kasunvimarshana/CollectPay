<?php

declare(strict_types=1);

namespace Application\UseCases\User;

use Domain\Repositories\UserRepositoryInterface;

/**
 * List Users Use Case
 */
final class ListUsersUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function execute(int $page = 1, int $perPage = 20): array
    {
        return $this->userRepository->findAll($page, $perPage);
    }
}
