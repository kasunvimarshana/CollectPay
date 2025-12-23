<?php

namespace App\Policies;

use App\Models\Supplier;
use App\Models\User;

class SupplierPolicy
{
    /**
     * Determine if the user can view any suppliers.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager', 'collector', 'viewer']);
    }

    /**
     * Determine if the user can view the supplier.
     */
    public function view(User $user, Supplier $supplier): bool
    {
        // Admin and manager can view all
        if (in_array($user->role, ['admin', 'manager'])) {
            return true;
        }

        // ABAC: Check if user has access to this specific supplier
        $userAttributes = $user->attributes ?? [];
        if (isset($userAttributes['allowed_suppliers'])) {
            return in_array($supplier->id, $userAttributes['allowed_suppliers']);
        }

        // Collectors and viewers can view suppliers they created
        return $supplier->created_by === $user->id;
    }

    /**
     * Determine if the user can create suppliers.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager', 'collector']);
    }

    /**
     * Determine if the user can update the supplier.
     */
    public function update(User $user, Supplier $supplier): bool
    {
        // Admin can update all
        if ($user->role === 'admin') {
            return true;
        }

        // Manager can update all
        if ($user->role === 'manager') {
            return true;
        }

        // ABAC: Check if user has access to this specific supplier
        $userAttributes = $user->attributes ?? [];
        if (isset($userAttributes['allowed_suppliers'])) {
            return in_array($supplier->id, $userAttributes['allowed_suppliers']);
        }

        // Collectors can update suppliers they created
        return $user->role === 'collector' && $supplier->created_by === $user->id;
    }

    /**
     * Determine if the user can delete the supplier.
     */
    public function delete(User $user, Supplier $supplier): bool
    {
        // Only admin and manager can delete
        if (in_array($user->role, ['admin', 'manager'])) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can restore the supplier.
     */
    public function restore(User $user, Supplier $supplier): bool
    {
        return in_array($user->role, ['admin', 'manager']);
    }

    /**
     * Determine if the user can permanently delete the supplier.
     */
    public function forceDelete(User $user, Supplier $supplier): bool
    {
        return $user->role === 'admin';
    }
}
