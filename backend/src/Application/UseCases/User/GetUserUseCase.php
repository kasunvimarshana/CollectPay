<?php

declare(strict_types=1);

namespace Application\UseCases\User;

use Domain\Repositories\UserRepositoryInterface;
use Domain\ValueObjects\UserId;

/**
 * Get User Use Case
 */
final class GetUserUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function execute(string $id): ?\Domain\Entities\User
    {
        return $this->userRepository->findById(UserId::fromString($id));
    }
}
