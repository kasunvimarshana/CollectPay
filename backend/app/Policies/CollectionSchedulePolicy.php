<?php

namespace App\Policies;

use App\Models\CollectionSchedule;
use App\Models\User;

class CollectionSchedulePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CollectionSchedule $schedule): bool
    {
        return $user->canAccessSupplier((string)$schedule->supplier_id);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['manager','admin']);
    }

    public function update(User $user, CollectionSchedule $schedule): bool
    {
        return $user->hasAnyRole(['manager','admin']);
    }

    public function delete(User $user, CollectionSchedule $schedule): bool
    {
        return $user->hasRole('admin');
    }
}
