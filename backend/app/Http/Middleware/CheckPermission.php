<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     * ABAC middleware for attribute-based authorization
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
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

        // Check if user has all required permissions
        foreach ($permissions as $permission) {
            if (!$user->hasPermission($permission)) {
                return response()->json([
                    'message' => "Forbidden. Missing permission: {$permission}",
                ], 403);
            }
        }

        return $next($request);
    }
}
