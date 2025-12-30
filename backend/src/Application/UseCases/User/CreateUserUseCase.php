<?php

declare(strict_types=1);

namespace Application\UseCases\User;

use Domain\Entities\User;
use Domain\Repositories\UserRepositoryInterface;
use Domain\Services\UuidGeneratorInterface;
use Domain\ValueObjects\Email;
use Application\DTOs\CreateUserDTO;
use Illuminate\Support\Facades\Hash;

/**
 * Create User Use Case
 * Handles the business logic for creating a new user
 */
final class CreateUserUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly UuidGeneratorInterface $uuidGenerator
    ) {}

    public function execute(CreateUserDTO $dto): User
    {
        // Check if email already exists
        $email = Email::fromString($dto->email);
        $existingUser = $this->userRepository->findByEmail($email);
        if ($existingUser) {
            throw new \DomainException("User with email '{$dto->email}' already exists");
        }

        // Hash password
        $passwordHash = Hash::make($dto->password);

        // Generate UUID for new user
        $id = $this->uuidGenerator->generate();

        // Create new user entity
        $user = User::create(
            $id,
            $dto->name,
            $email,
            $passwordHash,
            $dto->roles
        );

        // Persist to repository
        $this->userRepository->save($user);

        return $user;
    }
}
