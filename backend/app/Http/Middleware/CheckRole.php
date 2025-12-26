<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * RBAC middleware for role-based authorization
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Admin always has access
        if ($user->role === 'admin') {
            return $next($request);
        }

        // Check if user has required role
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Forbidden. Required role(s): ' . implode(', ', $roles),
            ], 403);
        }

        return $next($request);
    }
}
