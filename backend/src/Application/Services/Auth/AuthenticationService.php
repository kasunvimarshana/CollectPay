<?php

namespace Application\Services\Auth;

use Domain\User\UserRepositoryInterface;
use Application\Exceptions\AuthenticationException;
use Application\Exceptions\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * Authentication Service - Handles login, token generation, and validation
 */
class AuthenticationService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function login(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            throw new AuthenticationException('Invalid credentials');
        }

        if (!$user->isActive()) {
            throw new AuthenticationException('Account is inactive');
        }

        if (!password_verify($password, $user->passwordHash())) {
            throw new AuthenticationException('Invalid credentials');
        }

        // Update last login
        $user->recordLogin();
        $this->userRepository->save($user);

        // Generate JWT token
        $token = JWTAuth::fromUser($this->toAuthModel($user));

        return [
            'token' => $token,
            'user' => [
                'id' => $user->id()->value(),
                'name' => $user->name(),
                'email' => $user->email()->value(),
                'role' => $user->role()->name(),
            ],
        ];
    }

    public function validateToken(string $token): array
    {
        try {
            $payload = JWTAuth::setToken($token)->getPayload();

            return [
                'user_id' => $payload->get('sub'),
                'role' => $payload->get('role'),
                'email' => $payload->get('email'),
            ];
        } catch (\Exception $e) {
            throw new AuthenticationException('Invalid token');
        }
    }

    public function refreshToken(string $token): string
    {
        try {
            return JWTAuth::setToken($token)->refresh();
        } catch (\Exception $e) {
            throw new AuthenticationException('Cannot refresh token');
        }
    }

    public function logout(string $token): void
    {
        try {
            JWTAuth::setToken($token)->invalidate();
        } catch (\Exception $e) {
            // Token already invalid or expired
        }
    }

    private function toAuthModel($user)
    {
        // Convert domain entity to authentication model
        return (object) [
            'id' => $user->id()->value(),
            'email' => $user->email()->value(),
            'role' => $user->role()->name(),
        ];
    }
}
