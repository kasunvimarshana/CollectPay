<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    /**
     * Determine if the user can view any payments.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager', 'collector', 'viewer']);
    }

    /**
     * Determine if the user can view the payment.
     */
    public function view(User $user, Payment $payment): bool
    {
        // Admin and manager can view all
        if (in_array($user->role, ['admin', 'manager'])) {
            return true;
        }

        // ABAC: Check if user has access to the supplier
        $userAttributes = $user->attributes ?? [];
        if (isset($userAttributes['allowed_suppliers'])) {
            return in_array($payment->supplier_id, $userAttributes['allowed_suppliers']);
        }

        // Collectors and viewers can view payments they created
        return $payment->created_by === $user->id;
    }

    /**
     * Determine if the user can create payments.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager', 'collector']);
    }

    /**
     * Determine if the user can update the payment.
     */
    public function update(User $user, Payment $payment): bool
    {
        // Only admin and manager can update payments
        // Payments are typically immutable once created
        return in_array($user->role, ['admin', 'manager']);
    }

    /**
     * Determine if the user can delete the payment.
     */
    public function delete(User $user, Payment $payment): bool
    {
        // Only admin can delete payments
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can restore the payment.
     */
    public function restore(User $user, Payment $payment): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can permanently delete the payment.
     */
    public function forceDelete(User $user, Payment $payment): bool
    {
        return $user->role === 'admin';
    }
}
