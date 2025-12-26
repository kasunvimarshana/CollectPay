<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Application\UseCases\RegisterUserUseCase;
use App\Application\UseCases\LoginUserUseCase;
use App\Application\DTOs\RegisterUserDTO;
use App\Application\DTOs\LoginUserDTO;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private RegisterUserUseCase $registerUserUseCase,
        private LoginUserUseCase $loginUserUseCase
    ) {
    }
    /**
     * @OA\Post(
     *     path="/api/auth/register",
     *     tags={"Authentication"},
     *     summary="Register a new user",
     *     description="Create a new user account. Default role is 'collector'. Only admins can create other admins.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="password", type="string", format="password", minLength=8, example="password123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="password123"),
     *             @OA\Property(property="role", type="string", enum={"admin","collector","finance"}, example="collector", description="Optional. Only available for admin users")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User registered successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="email", type="string", example="john@example.com"),
     *                 @OA\Property(property="role", type="string", example="collector"),
     *                 @OA\Property(property="is_active", type="boolean", example=true)
     *             ),
     *             @OA\Property(property="token", type="string", example="1|abc123...")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|in:admin,collector,finance',
        ]);

        try {
            // Get requesting user's role if authenticated
            $requestingUserRole = $request->user() ? $request->user()->role : null;
            
            $dto = RegisterUserDTO::fromArray($validated);
            $userEntity = $this->registerUserUseCase->execute($dto, $requestingUserRole);
            
            // Get the created user model to generate token
            $user = User::find($userEntity->getId());
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $userEntity->toArray(),
                'token' => $token,
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to register user', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to register user'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/auth/login",
     *     tags={"Authentication"},
     *     summary="Login user",
     *     description="Authenticate user and receive access token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="admin@trackvault.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Admin User"),
     *                 @OA\Property(property="email", type="string", example="admin@trackvault.com"),
     *                 @OA\Property(property="role", type="string", example="admin")
     *             ),
     *             @OA\Property(property="token", type="string", example="1|abc123...")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Invalid credentials")
     * )
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        try {
            $dto = LoginUserDTO::fromArray($validated);
            $userEntity = $this->loginUserUseCase->execute($dto);
            
            // Get the user model to generate token
            $user = User::find($userEntity->getId());
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $userEntity->toArray(),
                'token' => $token,
            ]);
        } catch (ValidationException $e) {
            throw $e; // Re-throw validation exceptions
        } catch (\Exception $e) {
            \Log::error('Failed to login user', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to login'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/auth/logout",
     *     tags={"Authentication"},
     *     summary="Logout user",
     *     description="Revoke current access token",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Logged out successfully")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/auth/me",
     *     tags={"Authentication"},
     *     summary="Get current user",
     *     description="Retrieve authenticated user details",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="User details",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="Admin User"),
     *             @OA\Property(property="email", type="string", example="admin@trackvault.com"),
     *             @OA\Property(property="role", type="string", example="admin"),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
