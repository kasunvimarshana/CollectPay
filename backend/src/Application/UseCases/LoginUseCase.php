<?php

declare(strict_types=1);

namespace TrackVault\Application\UseCases;

use TrackVault\Domain\Repositories\UserRepositoryInterface;
use TrackVault\Domain\Services\PasswordHashService;
use TrackVault\Domain\ValueObjects\Email;
use TrackVault\Infrastructure\Security\JwtService;

/**
 * Login Use Case
 */
final class LoginUseCase
{
    private UserRepositoryInterface $userRepository;
    private PasswordHashService $passwordHashService;
    private JwtService $jwtService;

    public function __construct(
        UserRepositoryInterface $userRepository,
        PasswordHashService $passwordHashService,
        JwtService $jwtService
    ) {
        $this->userRepository = $userRepository;
        $this->passwordHashService = $passwordHashService;
        $this->jwtService = $jwtService;
    }

    public function execute(string $email, string $password): array
    {
        // Find user by email
        $user = $this->userRepository->findByEmail(new Email($email));

        if ($user === null) {
            throw new \RuntimeException('Invalid credentials');
        }

        // Verify password
        if (!$this->passwordHashService->verify($password, $user->getPasswordHash())) {
            throw new \RuntimeException('Invalid credentials');
        }

        // Generate JWT token
        $token = $this->jwtService->generateToken([
            'user_id' => $user->getId()->toString(),
            'email' => $user->getEmail()->toString(),
            'roles' => $user->getRoles(),
            'permissions' => $user->getPermissions(),
        ]);

        return [
            'token' => $token,
            'user' => $user->toArray(),
        ];
    }
}
