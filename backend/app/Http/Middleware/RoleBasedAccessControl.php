<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleBasedAccessControl
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$request->user()->is_active) {
            return response()->json(['message' => 'Account is inactive.'], 403);
        }

        if (empty($roles)) {
            return $next($request);
        }

        if (!$request->user()->hasAnyRole($roles)) {
            return response()->json([
                'message' => 'Unauthorized. Required role: ' . implode(' or ', $roles)
            ], 403);
        }

        return $next($request);
    }
}
