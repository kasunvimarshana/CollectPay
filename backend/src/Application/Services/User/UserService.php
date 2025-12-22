<?php

namespace Application\Services\User;

use Domain\User\User;
use Domain\User\UserRole;
use Domain\User\UserRepositoryInterface;
use Domain\Shared\ValueObjects\Email;
use Application\DTO\User\CreateUserDTO;
use Application\DTO\User\UpdateUserDTO;
use Application\Exceptions\ValidationException;
use Application\Exceptions\NotFoundException;

/**
 * User Service - Application Layer Use Case
 * Orchestrates user-related operations
 */
class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function createUser(CreateUserDTO $dto): User
    {
        // Validate email uniqueness
        if ($this->userRepository->emailExists($dto->email)) {
            throw new ValidationException('Email already exists');
        }

        $user = User::create(
            $dto->name,
            Email::fromString($dto->email),
            password_hash($dto->password, PASSWORD_BCRYPT),
            UserRole::fromString($dto->role)
        );

        $this->userRepository->save($user);

        return $user;
    }

    public function updateUser(string $id, UpdateUserDTO $dto): User
    {
        $user = $this->userRepository->findById($id);

        if (!$user) {
            throw new NotFoundException('User not found');
        }

        if ($dto->name) {
            $user->updateProfile($dto->name);
        }

        if ($dto->role) {
            $user->changeRole(UserRole::fromString($dto->role));
        }

        if ($dto->password) {
            $user->changePassword(password_hash($dto->password, PASSWORD_BCRYPT));
        }

        $this->userRepository->save($user);

        return $user;
    }

    public function getUserById(string $id): User
    {
        $user = $this->userRepository->findById($id);

        if (!$user) {
            throw new NotFoundException('User not found');
        }

        return $user;
    }

    public function getUserByEmail(string $email): User
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            throw new NotFoundException('User not found');
        }

        return $user;
    }

    public function getAllUsers(int $page = 1, int $perPage = 20): array
    {
        return $this->userRepository->findAll($page, $perPage);
    }

    public function activateUser(string $id): void
    {
        $user = $this->getUserById($id);
        $user->activate();
        $this->userRepository->save($user);
    }

    public function deactivateUser(string $id): void
    {
        $user = $this->getUserById($id);
        $user->deactivate();
        $this->userRepository->save($user);
    }

    public function deleteUser(string $id): void
    {
        if (!$this->userRepository->exists($id)) {
            throw new NotFoundException('User not found');
        }

        $this->userRepository->delete($id);
    }

    public function recordLogin(string $id): void
    {
        $user = $this->getUserById($id);
        $user->recordLogin();
        $this->userRepository->save($user);
    }
}
