<?php

declare(strict_types=1);

namespace Presentation\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Check Role Middleware
 * 
 * Verifies that the authenticated user has one of the required roles.
 * Implements RBAC (Role-Based Access Control) for API endpoints.
 */
final class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Check if user has any of the required roles
        foreach ($roles as $role) {
            if ($this->userHasRole($user, $role)) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Unauthorized. Required role: ' . implode(' or ', $roles),
        ], 403);
    }

    /**
     * Check if user has a specific role.
     */
    private function userHasRole($user, string $role): bool
    {
        if (!isset($user->roles) || !is_array($user->roles)) {
            return false;
        }

        return in_array($role, $user->roles, true);
    }
}
