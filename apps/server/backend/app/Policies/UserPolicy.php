<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function before(User $actor, $ability)
    {
        if ($actor->role === 'admin') return true;
    }

    public function viewAny(User $actor)
    {
        return in_array($actor->role, ['admin','manager','user']);
    }

    public function create(User $actor)
    {
        return $actor->role === 'manager';
    }

    public function update(User $actor, User $target)
    {
        if ($actor->id === $target->id) return true; // ABAC: owner can update self
        if ($actor->role === 'manager') {
            $aDept = $actor->attributes['department'] ?? null;
            $tDept = $target->attributes['department'] ?? null;
            return $aDept && $aDept === $tDept;
        }
        return false;
    }

    public function delete(User $actor, User $target)
    {
        if ($actor->role === 'manager') {
            $aDept = $actor->attributes['department'] ?? null;
            $tDept = $target->attributes['department'] ?? null;
            return $aDept && $aDept === $tDept;
        }
        return false;
    }
}
