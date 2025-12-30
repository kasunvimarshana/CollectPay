<?php

declare(strict_types=1);

namespace Presentation\Http\Controllers;

use Application\DTOs\CreateUserDTO;
use Application\UseCases\User\CreateUserUseCase;
use Application\UseCases\User\GetUserUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Authentication Controller
 * 
 * Handles user authentication including registration, login, logout,
 * and retrieving the current authenticated user.
 */
final class AuthController extends Controller
{
    public function __construct(
        private readonly CreateUserUseCase $createUser,
        private readonly GetUserUseCase $getUser
    ) {}

    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'array',
            'roles.*' => 'string|in:admin,manager,collector,viewer',
        ]);

        try {
            $dto = CreateUserDTO::fromArray([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'roles' => $validated['roles'] ?? ['collector'],
                'is_active' => true,
            ]);

            $user = $this->createUser->execute($dto);

            // Get the Laravel model to create token
            $userModel = \App\Models\User::where('email', $validated['email'])->first();
            $token = $userModel->createToken('auth_token')->plainTextToken;

            return $this->created([
                'user' => [
                    'id' => $user->id(),
                    'name' => $user->name(),
                    'email' => $user->email()->value(),
                    'roles' => $user->roles(),
                    'is_active' => $user->isActive(),
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (\Exception $e) {
            return $this->error('Registration failed: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Login a user and return an authentication token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $userModel = \App\Models\User::where('email', $credentials['email'])->first();

        if (!$userModel || !Hash::check($credentials['password'], $userModel->password)) {
            return $this->error('Invalid credentials', 401);
        }

        if (!$userModel->is_active) {
            return $this->error('Account is inactive', 403);
        }

        try {
            $user = $this->getUser->execute($userModel->id);
            $token = $userModel->createToken('auth_token')->plainTextToken;

            return $this->success([
                'user' => [
                    'id' => $user->id(),
                    'name' => $user->name(),
                    'email' => $user->email()->value(),
                    'roles' => $user->roles(),
                    'is_active' => $user->isActive(),
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (\Exception $e) {
            return $this->error('Login failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Logout the authenticated user.
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();
            
            return $this->success([
                'message' => 'Successfully logged out',
            ]);
        } catch (\Exception $e) {
            return $this->error('Logout failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get the authenticated user's information.
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $userModel = $request->user();
            $user = $this->getUser->execute($userModel->id);

            return $this->success([
                'id' => $user->id(),
                'name' => $user->name(),
                'email' => $user->email()->value(),
                'roles' => $user->roles(),
                'is_active' => $user->isActive(),
                'created_at' => $user->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $user->updatedAt()->format('Y-m-d H:i:s'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to retrieve user: ' . $e->getMessage(), 500);
        }
    }
}
