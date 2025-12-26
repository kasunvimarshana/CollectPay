<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$permissions
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$permissions)
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $userPermissions = $request->user()->permissions ?? [];
        
        // If permissions is a JSON string, decode it
        if (is_string($userPermissions)) {
            $userPermissions = json_decode($userPermissions, true) ?? [];
        }

        // Check if user has at least one of the required permissions
        $hasPermission = false;
        foreach ($permissions as $permission) {
            if (in_array($permission, $userPermissions)) {
                $hasPermission = true;
                break;
            }
        }

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Insufficient permissions',
                'required_permissions' => $permissions,
                'user_permissions' => $userPermissions,
            ], 403);
        }

        return $next($request);
    }
}
