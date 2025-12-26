<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Domain\User\Enums\UserRole;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Admin has all permissions
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Check role-based permissions
        $rolePermissions = UserRole::from($user->role)->getPermissions();
        
        if (in_array($permission, $rolePermissions)) {
            return $next($request);
        }

        // Check custom permissions
        if ($user->hasPermission($permission)) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Permission denied: ' . $permission,
        ], 403);
    }
}
