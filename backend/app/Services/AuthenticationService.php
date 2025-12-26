<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\AuthenticationException;

class AuthenticationService
{
    /**
     * Register a new user.
     */
    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'is_active' => true,
        ]);

        // Assign default collector role
        $collectorRole = \App\Models\Role::where('name', 'collector')->first();
        if ($collectorRole) {
            $user->roles()->attach($collectorRole);
        }

        return $user;
    }

    /**
     * Authenticate user and create token.
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw new AuthenticationException('Invalid credentials');
        }

        if (!$user->is_active) {
            throw new AuthenticationException('User account is inactive');
        }

        // Create personal access token (Sanctum)
        $token = $user->createToken('api-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Get authenticated user from token.
     */
    public function getUser(User $user): User
    {
        return $user->load(['roles', 'roles.permissions']);
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(User $user): bool
    {
        $user->tokens()->delete();
        return true;
    }

    /**
     * Check if user can access resource.
     */
    public function authorize(User $user, string $permission): bool
    {
        return $user->hasPermission($permission);
    }
}
