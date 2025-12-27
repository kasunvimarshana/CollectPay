<?php

declare(strict_types=1);

namespace TrackVault\Presentation\Controllers;

use TrackVault\Application\UseCases\LoginUseCase;
use TrackVault\Application\UseCases\CreateUserUseCase;
use Exception;

/**
 * Authentication Controller
 * 
 * Handles user authentication and registration
 */
final class AuthController extends BaseController
{
    private LoginUseCase $loginUseCase;
    private CreateUserUseCase $createUserUseCase;

    public function __construct(LoginUseCase $loginUseCase, CreateUserUseCase $createUserUseCase)
    {
        $this->loginUseCase = $loginUseCase;
        $this->createUserUseCase = $createUserUseCase;
    }

    public function login(): void
    {
        try {
            $data = $this->getRequestBody();
            
            if (empty($data['email']) || empty($data['password'])) {
                $this->errorResponse('Email and password are required', 'VALIDATION_ERROR', 400);
                return;
            }

            $result = $this->loginUseCase->execute($data['email'], $data['password']);
            
            $this->successResponse([
                'token' => $result['token'],
                'user' => $result['user'],
            ], 'Login successful');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'LOGIN_FAILED', 401);
        }
    }

    public function register(): void
    {
        try {
            $data = $this->getRequestBody();
            
            if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
                $this->errorResponse('Name, email and password are required', 'VALIDATION_ERROR', 400);
                return;
            }

            $roles = $data['roles'] ?? ['user'];
            $permissions = $data['permissions'] ?? [];

            $user = $this->createUserUseCase->execute(
                $data['name'],
                $data['email'],
                $data['password'],
                $roles,
                $permissions
            );
            
            $this->successResponse($user->toArray(), 'User created successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'REGISTRATION_FAILED', 400);
        }
    }

    public function logout(): void
    {
        // In a stateless JWT system, logout is handled client-side
        // The client should remove the token from storage
        $this->successResponse(null, 'Logout successful');
    }
}
