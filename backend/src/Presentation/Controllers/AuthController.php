<?php

namespace App\Presentation\Controllers;

use App\Infrastructure\Repositories\MySQLUserRepository;
use App\Infrastructure\Security\AuthService;
use App\Domain\Entities\User;

/**
 * Authentication Controller
 * Handles user authentication (login, register, logout)
 */
class AuthController extends BaseController
{
    private MySQLUserRepository $userRepository;
    
    public function __construct()
    {
        $this->userRepository = new MySQLUserRepository();
    }
    
    /**
     * User login
     */
    public function login(): void
    {
        $data = $this->getJsonBody();
        
        $errors = $this->validateRequired($data, ['email', 'password']);
        if (!empty($errors)) {
            $this->errorResponse('Validation failed', 422, $errors);
        }
        
        // Find user by email
        $user = $this->userRepository->findByEmail($data['email']);
        
        if (!$user) {
            $this->errorResponse('Invalid credentials', 401);
        }
        
        // Verify password
        if (!AuthService::verifyPassword($data['password'], $user->getPasswordHash())) {
            $this->errorResponse('Invalid credentials', 401);
        }
        
        // Check if user is active
        if (!$user->isActive()) {
            $this->errorResponse('Account is inactive', 403);
        }
        
        // Generate token
        $token = AuthService::generateToken($user->getId());
        
        $this->successResponse([
            'token' => $token,
            'user' => $user->toArray(),
        ], 'Login successful');
    }
    
    /**
     * User registration
     */
    public function register(): void
    {
        $data = $this->getJsonBody();
        
        $errors = $this->validateRequired($data, ['name', 'email', 'password']);
        if (!empty($errors)) {
            $this->errorResponse('Validation failed', 422, $errors);
        }
        
        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->errorResponse('Invalid email format', 422);
        }
        
        // Check if email already exists
        if ($this->userRepository->emailExists($data['email'])) {
            $this->errorResponse('Email already exists', 409);
        }
        
        // Hash password
        $passwordHash = AuthService::hashPassword($data['password']);
        
        // Determine roles (default to collector)
        $roles = $data['roles'] ?? ['collector'];
        
        // Create user entity
        $user = new User(
            $data['name'],
            $data['email'],
            $passwordHash,
            $roles
        );
        
        // Save user
        $savedUser = $this->userRepository->save($user);
        
        // Generate token
        $token = AuthService::generateToken($savedUser->getId());
        
        $this->successResponse([
            'token' => $token,
            'user' => $savedUser->toArray(),
        ], 'Registration successful', 201);
    }
    
    /**
     * Get current user
     */
    public function me(): void
    {
        $token = $this->getAuthToken();
        
        if (!$token) {
            $this->errorResponse('Unauthorized', 401);
        }
        
        $userId = AuthService::getUserIdFromToken($token);
        
        if (!$userId) {
            $this->errorResponse('Invalid token', 401);
        }
        
        $user = $this->userRepository->findById($userId);
        
        if (!$user) {
            $this->errorResponse('User not found', 404);
        }
        
        $this->successResponse($user->toArray());
    }
    
    /**
     * User logout (client-side token removal)
     */
    public function logout(): void
    {
        $this->successResponse(null, 'Logout successful');
    }
}
