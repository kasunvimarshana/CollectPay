<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Application\UseCases\User\CreateUserUseCase;
use Application\UseCases\User\GetUserUseCase;
use Application\UseCases\User\ListUsersUseCase;
use Application\DTOs\CreateUserDTO;
use Domain\Repositories\UserRepositoryInterface;
use Domain\ValueObjects\UserId;

class UserController extends Controller
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly CreateUserUseCase $createUserUseCase,
        private readonly GetUserUseCase $getUserUseCase,
        private readonly ListUsersUseCase $listUsersUseCase
    ) {}

    /**
     * Display a listing of users.
     */
    public function index(Request $request): JsonResponse
    {
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 20);

        $users = $this->listUsersUseCase->execute((int) $page, (int) $perPage);

        return response()->json([
            'data' => array_map(fn($user) => $user->toArray(), $users),
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'roles' => 'nullable|array',
            'roles.*' => 'string|in:user,admin,collector,manager',
        ]);

        try {
            $dto = CreateUserDTO::fromArray($validated);
            $user = $this->createUserUseCase->execute($dto);

            return response()->json([
                'message' => 'User created successfully',
                'data' => $user->toArray(),
            ], 201);
        } catch (\DomainException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified user.
     */
    public function show(string $id): JsonResponse
    {
        $user = $this->getUserUseCase->execute($id);

        if (!$user) {
            return response()->json([
                'error' => 'User not found',
            ], 404);
        }

        return response()->json([
            'data' => $user->toArray(),
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $userId = UserId::fromString($id);
        $user = $this->userRepository->findById($userId);

        if (!$user) {
            return response()->json([
                'error' => 'User not found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user->updateName($validated['name']);
        $this->userRepository->save($user);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user->toArray(),
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(string $id): JsonResponse
    {
        $userId = UserId::fromString($id);
        $user = $this->userRepository->findById($userId);

        if (!$user) {
            return response()->json([
                'error' => 'User not found',
            ], 404);
        }

        $user->delete();
        $this->userRepository->save($user);

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }
}
