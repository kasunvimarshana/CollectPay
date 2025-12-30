<?php

declare(strict_types=1);

namespace Application\UseCases\User;

use Application\DTOs\CreateUserDTO;
use Domain\Entities\User;
use Domain\Repositories\UserRepositoryInterface;
use Domain\ValueObjects\Email;

/**
 * Use Case: Create a new user
 * 
 * This use case handles the creation of a new user in the system.
 * It follows Clean Architecture principles by:
 * - Accepting DTOs as input
 * - Using domain repositories for persistence
 * - Returning domain entities
 */
final class CreateUserUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param CreateUserDTO $dto
     * @return User
     * @throws \InvalidArgumentException
     */
    public function execute(CreateUserDTO $dto): User
    {
        // Validate email format
        $email = new Email($dto->email);

        // Check if user with same email already exists
        if ($this->userRepository->findByEmail($email->value())) {
            throw new \InvalidArgumentException("User with email {$email->value()} already exists");
        }

        // Generate UUID for user
        $id = \Illuminate\Support\Str::uuid()->toString();

        // Create user entity
        $user = User::create(
            id: $id,
            name: $dto->name,
            email: $email,
            passwordHash: password_hash($dto->password, PASSWORD_BCRYPT),
            roles: $dto->roles
        );

        // Persist user
        return $this->userRepository->save($user);
    }
}
