<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine if the user can view any products.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager', 'collector', 'viewer']);
    }

    /**
     * Determine if the user can view the product.
     */
    public function view(User $user, Product $product): bool
    {
        // Admin and manager can view all
        if (in_array($user->role, ['admin', 'manager'])) {
            return true;
        }

        // ABAC: Check if user has access to the supplier
        $userAttributes = $user->attributes ?? [];
        if (isset($userAttributes['allowed_suppliers'])) {
            return in_array($product->supplier_id, $userAttributes['allowed_suppliers']);
        }

        // Collectors and viewers can view products they created
        return $product->created_by === $user->id;
    }

    /**
     * Determine if the user can create products.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager', 'collector']);
    }

    /**
     * Determine if the user can update the product.
     */
    public function update(User $user, Product $product): bool
    {
        // Admin can update all
        if ($user->role === 'admin') {
            return true;
        }

        // Manager can update all
        if ($user->role === 'manager') {
            return true;
        }

        // ABAC: Check if user has access to the supplier
        $userAttributes = $user->attributes ?? [];
        if (isset($userAttributes['allowed_suppliers'])) {
            return in_array($product->supplier_id, $userAttributes['allowed_suppliers']);
        }

        // Collectors can update products they created
        return $user->role === 'collector' && $product->created_by === $user->id;
    }

    /**
     * Determine if the user can delete the product.
     */
    public function delete(User $user, Product $product): bool
    {
        return in_array($user->role, ['admin', 'manager']);
    }

    /**
     * Determine if the user can restore the product.
     */
    public function restore(User $user, Product $product): bool
    {
        return in_array($user->role, ['admin', 'manager']);
    }

    /**
     * Determine if the user can permanently delete the product.
     */
    public function forceDelete(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }
}
