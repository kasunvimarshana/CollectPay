<?php

declare(strict_types=1);

namespace Presentation\Http\Controllers;

use Application\DTOs\UpdateUserDTO;
use Application\UseCases\User\UpdateUserUseCase;
use Application\UseCases\User\DeleteUserUseCase;
use Application\UseCases\User\GetUserUseCase;
use Application\UseCases\User\ListUsersUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * User Controller
 * 
 * Handles CRUD operations for users.
 * Follows Clean Architecture by delegating all business logic to use cases.
 * Note: User creation is handled by AuthController::register
 */
final class UserController extends Controller
{
    public function __construct(
        private readonly UpdateUserUseCase $updateUser,
        private readonly DeleteUserUseCase $deleteUser,
        private readonly GetUserUseCase $getUser,
        private readonly ListUsersUseCase $listUsers
    ) {}

    /**
     * List all users with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'is_active' => 'boolean',
            'role' => 'string|in:admin,manager,collector,viewer',
            'search' => 'string|max:255',
        ]);

        try {
            $filters = [];
            if (isset($validated['is_active'])) {
                $filters['is_active'] = $validated['is_active'];
            }
            if (isset($validated['role'])) {
                $filters['role'] = $validated['role'];
            }
            if (isset($validated['search'])) {
                $filters['search'] = $validated['search'];
            }

            $result = $this->listUsers->execute(
                page: (int) ($validated['page'] ?? 1),
                perPage: (int) ($validated['per_page'] ?? 15),
                filters: $filters
            );

            return $this->paginated([
                'data' => array_map(fn($user) => [
                    'id' => $user->id(),
                    'name' => $user->name(),
                    'email' => $user->email()->value(),
                    'roles' => $user->roles(),
                    'is_active' => $user->isActive(),
                    'created_at' => $user->createdAt()->format('Y-m-d H:i:s'),
                    'updated_at' => $user->updatedAt()->format('Y-m-d H:i:s'),
                ], $result['data']),
                'total' => $result['total'],
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'last_page' => $result['last_page'],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to list users: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a single user by ID.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = $this->getUser->execute($id);

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
            return $this->error('User not found: ' . $e->getMessage(), 404);
        }
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'string|email|max:255|unique:users,email,' . $id,
            'password' => 'string|min:8|confirmed',
            'roles' => 'array',
            'roles.*' => 'string|in:admin,manager,collector,viewer',
            'is_active' => 'boolean',
        ]);

        try {
            $dto = UpdateUserDTO::fromArray($validated);
            $user = $this->updateUser->execute($id, $dto);

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
            return $this->error('Failed to update user: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Delete a user (soft delete).
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->deleteUser->execute($id);
            return $this->noContent();
        } catch (\Exception $e) {
            return $this->error('Failed to delete user: ' . $e->getMessage(), 422);
        }
    }
}
