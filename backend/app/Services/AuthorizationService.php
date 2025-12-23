<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Authorization Service
 * 
 * Implements RBAC (Role-Based Access Control) and ABAC (Attribute-Based Access Control)
 * for fine-grained permission management.
 */
class AuthorizationService
{
    /**
     * Role hierarchy and permissions
     */
    private const ROLE_PERMISSIONS = [
        'admin' => [
            'users.*',
            'suppliers.*',
            'products.*',
            'collections.*',
            'payments.*',
            'rates.*',
            'sync.*',
            'reports.*',
        ],
        'manager' => [
            'suppliers.read',
            'suppliers.create',
            'suppliers.update',
            'products.read',
            'products.create',
            'products.update',
            'collections.read',
            'payments.read',
            'rates.*',
            'reports.read',
        ],
        'collector' => [
            'suppliers.read',
            'products.read',
            'collections.*',
            'payments.*',
            'rates.read',
        ],
        'viewer' => [
            'suppliers.read',
            'products.read',
            'collections.read',
            'payments.read',
            'rates.read',
        ],
    ];
    
    /**
     * Check if user has permission (RBAC)
     * 
     * @param User $user
     * @param string $permission
     * @return bool
     */
    public function hasPermission(User $user, string $permission): bool
    {
        $rolePermissions = self::ROLE_PERMISSIONS[$user->role] ?? [];
        
        foreach ($rolePermissions as $rolePermission) {
            if ($this->matchesPermission($permission, $rolePermission)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Match permission against pattern (supports wildcards)
     * 
     * @param string $permission
     * @param string $pattern
     * @return bool
     */
    private function matchesPermission(string $permission, string $pattern): bool
    {
        if ($pattern === $permission) {
            return true;
        }
        
        if (str_ends_with($pattern, '.*')) {
            $prefix = substr($pattern, 0, -2);
            return str_starts_with($permission, $prefix);
        }
        
        return false;
    }
    
    /**
     * Check if user can access resource (ABAC)
     * 
     * @param User $user
     * @param string $action
     * @param Model|null $resource
     * @param array $context
     * @return bool
     */
    public function canAccess(User $user, string $action, ?Model $resource = null, array $context = []): bool
    {
        // First check RBAC permission
        if (!$this->hasPermission($user, $action)) {
            return false;
        }
        
        // If no resource provided, RBAC check is sufficient
        if (!$resource) {
            return true;
        }
        
        // Apply ABAC rules based on resource and context
        return $this->checkAttributeBasedRules($user, $action, $resource, $context);
    }
    
    /**
     * Apply attribute-based access control rules
     * 
     * @param User $user
     * @param string $action
     * @param Model $resource
     * @param array $context
     * @return bool
     */
    private function checkAttributeBasedRules(User $user, string $action, Model $resource, array $context): bool
    {
        $resourceType = class_basename($resource);
        
        // Admin has access to everything
        if ($user->role === 'admin') {
            return true;
        }
        
        // Manager can access all read operations and manage suppliers/products
        if ($user->role === 'manager') {
            if (str_ends_with($action, '.read')) {
                return true;
            }
            if (in_array($resourceType, ['Supplier', 'Product', 'ProductRate'])) {
                return true;
            }
        }
        
        // Collector can only access their own collections and payments
        if ($user->role === 'collector') {
            if (in_array($resourceType, ['Collection', 'Payment'])) {
                // Check if resource belongs to user
                if (method_exists($resource, 'user') && $resource->user_id === $user->id) {
                    return true;
                }
                // Allow creation (will be owned by user)
                if (str_ends_with($action, '.create')) {
                    return true;
                }
            }
            
            // Can read suppliers and products
            if (in_array($resourceType, ['Supplier', 'Product', 'ProductRate'])) {
                if (str_ends_with($action, '.read')) {
                    return true;
                }
            }
        }
        
        // Viewer can only read
        if ($user->role === 'viewer') {
            return str_ends_with($action, '.read');
        }
        
        // Check context-based rules
        if (isset($context['device_id'])) {
            // Allow if operating from same device
            if ($user->device_id === $context['device_id']) {
                return true;
            }
        }
        
        if (isset($context['location'])) {
            // Future: implement location-based access control
            // e.g., user can only access resources within their assigned region
        }
        
        if (isset($context['time'])) {
            // Future: implement time-based access control
            // e.g., certain operations only allowed during business hours
        }
        
        return false;
    }
    
    /**
     * Get all permissions for a user
     * 
     * @param User $user
     * @return array
     */
    public function getUserPermissions(User $user): array
    {
        return self::ROLE_PERMISSIONS[$user->role] ?? [];
    }
    
    /**
     * Check if user can perform action on multiple resources
     * 
     * @param User $user
     * @param string $action
     * @param array $resources
     * @param array $context
     * @return bool
     */
    public function canAccessBulk(User $user, string $action, array $resources, array $context = []): bool
    {
        foreach ($resources as $resource) {
            if (!$this->canAccess($user, $action, $resource, $context)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Filter resources based on user permissions
     * 
     * @param User $user
     * @param string $action
     * @param array $resources
     * @param array $context
     * @return array
     */
    public function filterAccessible(User $user, string $action, array $resources, array $context = []): array
    {
        return array_filter($resources, function ($resource) use ($user, $action, $context) {
            return $this->canAccess($user, $action, $resource, $context);
        });
    }
}
