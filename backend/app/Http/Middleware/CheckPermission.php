<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request with attribute-based access control.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $user = $request->user();

        // Check if user has required permission
        if (!$this->hasPermission($user, $permission)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You do not have permission to perform this action.',
            ], 403);
        }

        return $next($request);
    }

    /**
     * Check if user has the required permission.
     */
    private function hasPermission($user, string $permission): bool
    {
        // Admin role has all permissions
        if ($user->role === 'admin') {
            return true;
        }

        // Get user attributes (permissions)
        // The 'attributes' field should be cast as 'array' in the User model
        // and stored as JSON in the database
        $attributes = $user->attributes ?? [];

        // Check if permission exists in user attributes
        if (is_array($attributes) && isset($attributes['permissions']) && 
            is_array($attributes['permissions'])) {
            if (in_array($permission, $attributes['permissions'])) {
                return true;
            }
        }

        // Fall back to default role-based permissions
        $rolePermissions = [
            'manager' => [
                'view_suppliers',
                'create_suppliers',
                'edit_suppliers',
                'view_products',
                'create_products',
                'edit_products',
                'view_payments',
                'create_payments',
                'view_rates',
                'create_rates',
                'sync_data',
            ],
            'user' => [
                'view_suppliers',
                'view_products',
                'create_payments',
                'view_payments',
                'view_rates',
                'sync_data',
            ],
        ];

        $userRole = $user->role;

        return isset($rolePermissions[$userRole]) && 
               in_array($permission, $rolePermissions[$userRole]);
    }
}
