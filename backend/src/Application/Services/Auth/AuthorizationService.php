<?php

namespace Application\Services\Auth;

use Domain\User\User;
use Application\Exceptions\AuthorizationException;

/**
 * Authorization Service - Handles RBAC and ABAC
 */
class AuthorizationService
{
    private array $rolesConfig;
    private array $attributesConfig;

    public function __construct()
    {
        $this->rolesConfig = config('permissions.roles', []);
        $this->attributesConfig = config('permissions.attributes', []);
    }

    /**
     * Check if user has permission (RBAC)
     */
    public function authorize(User $user, string $permission): bool
    {
        // Admin has all permissions
        if ($user->role()->name() === 'admin') {
            return true;
        }

        return $user->hasPermission($permission);
    }

    /**
     * Check permission with attribute-based context (ABAC)
     */
    public function authorizeWithAttributes(
        User $user,
        string $permission,
        array $attributes = []
    ): bool {
        // Check basic RBAC first
        if (!$this->authorize($user, $permission)) {
            return false;
        }

        // Apply ABAC rules if enabled
        if (isset($attributes['resource_owner']) && $this->attributesConfig['ownership']['enabled'] ?? false) {
            // Check ownership for .own permissions
            if (str_ends_with($permission, '.own')) {
                return $attributes['resource_owner'] === $user->id()->value();
            }
        }

        if (isset($attributes['location']) && $this->attributesConfig['location']['enabled'] ?? false) {
            // Check location-based access
            $maxDistance = $this->attributesConfig['location']['max_distance_km'];
            // Location validation logic would go here
        }

        return true;
    }

    /**
     * Ensure user has permission or throw exception
     */
    public function ensureAuthorized(User $user, string $permission): void
    {
        if (!$this->authorize($user, $permission)) {
            throw new AuthorizationException("Insufficient permissions: {$permission}");
        }
    }

    /**
     * Ensure user has permission with attributes or throw exception
     */
    public function ensureAuthorizedWithAttributes(
        User $user,
        string $permission,
        array $attributes = []
    ): void {
        if (!$this->authorizeWithAttributes($user, $permission, $attributes)) {
            throw new AuthorizationException("Insufficient permissions: {$permission}");
        }
    }

    /**
     * Get all permissions for a user
     */
    public function getUserPermissions(User $user): array
    {
        return $user->role()->permissions();
    }

    /**
     * Check if user can perform action on resource
     */
    public function canPerformAction(User $user, string $action, string $resource, ?string $ownerId = null): bool
    {
        $permission = "{$resource}.{$action}";

        // Check if user owns the resource
        if ($ownerId && $ownerId === $user->id()->value()) {
            // Try .own permission first
            if ($this->authorize($user, "{$permission}.own")) {
                return true;
            }
        }

        return $this->authorize($user, $permission);
    }
}
