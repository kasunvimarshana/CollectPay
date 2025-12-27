<?php

declare(strict_types=1);

namespace TrackVault\Application\UseCases;

use TrackVault\Domain\Entities\User;
use TrackVault\Domain\Repositories\UserRepositoryInterface;
use TrackVault\Domain\Services\PasswordHashService;
use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Email;
use TrackVault\Infrastructure\Logging\AuditLogger;

/**
 * Create User Use Case
 */
final class CreateUserUseCase
{
    private UserRepositoryInterface $userRepository;
    private PasswordHashService $passwordHashService;
    private AuditLogger $auditLogger;

    public function __construct(
        UserRepositoryInterface $userRepository,
        PasswordHashService $passwordHashService,
        AuditLogger $auditLogger
    ) {
        $this->userRepository = $userRepository;
        $this->passwordHashService = $passwordHashService;
        $this->auditLogger = $auditLogger;
    }

    public function execute(array $data, string $createdBy): User
    {
        // Validate required fields
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            throw new \InvalidArgumentException('Name, email, and password are required');
        }

        $email = new Email($data['email']);

        // Check if user already exists
        if ($this->userRepository->findByEmail($email) !== null) {
            throw new \RuntimeException('User with this email already exists');
        }

        // Hash password
        $passwordHash = $this->passwordHashService->hash($data['password']);

        // Create user
        $user = new User(
            UserId::generate(),
            $data['name'],
            $email,
            $passwordHash,
            $data['roles'] ?? [],
            $data['permissions'] ?? []
        );

        // Save user
        $this->userRepository->save($user);

        // Log audit trail
        $this->auditLogger->logCreate($createdBy, 'User', $user->getId()->toString(), $user->toArray());

        return $user;
    }
}
