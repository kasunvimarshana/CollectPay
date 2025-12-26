<?php

namespace App\Domain\User\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Domain\Shared\Traits\HasUuid;
use App\Domain\Shared\Traits\Syncable;
use App\Domain\User\Enums\UserRole;
use App\Domain\Collection\Models\Collection;
use App\Domain\Payment\Models\Payment;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasUuid, Syncable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'permissions',
        'is_active',
        'device_id',
        'last_login_at',
        'client_id',
        'version',
        'synced_at',
        'is_dirty',
        'sync_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'synced_at' => 'datetime',
        'password' => 'hashed',
        'permissions' => 'array',
        'is_active' => 'boolean',
        'is_dirty' => 'boolean',
        'version' => 'integer',
    ];

    // Relationships
    public function collections()
    {
        return $this->hasMany(Collection::class, 'collected_by');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'paid_by');
    }

    public function approvedPayments()
    {
        return $this->hasMany(Payment::class, 'approved_by');
    }

    // Role checks
    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN->value;
    }

    public function isManager(): bool
    {
        return $this->role === UserRole::MANAGER->value;
    }

    public function isCollector(): bool
    {
        return $this->role === UserRole::COLLECTOR->value;
    }

    // Permission checks
    public function hasPermission(string $permission): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        return in_array($permission, $this->permissions ?? []);
    }

    public function hasAnyPermission(array $permissions): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        return !empty(array_intersect($permissions, $this->permissions ?? []));
    }

    // ABAC checks
    public function canAccessResource(string $resource, string $action, array $context = []): bool
    {
        // Admin has full access
        if ($this->isAdmin()) {
            return true;
        }

        // Check role-based permissions
        $rolePermissions = UserRole::from($this->role)->getPermissions();
        $requiredPermission = "{$resource}.{$action}";

        if (!in_array($requiredPermission, $rolePermissions)) {
            return false;
        }

        // Check attribute-based conditions
        return $this->evaluateAbacConditions($resource, $action, $context);
    }

    protected function evaluateAbacConditions(string $resource, string $action, array $context): bool
    {
        // Collectors can only access their own collections
        if ($resource === 'collections' && $this->isCollector()) {
            if (isset($context['owner_id']) && $context['owner_id'] !== $this->id) {
                return false;
            }
        }

        // Region-based access control
        if (isset($context['region']) && !empty($this->allowed_regions)) {
            if (!in_array($context['region'], $this->allowed_regions ?? [])) {
                return false;
            }
        }

        return true;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }
}
