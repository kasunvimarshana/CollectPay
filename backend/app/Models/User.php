<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'attributes',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'attributes' => 'array',
        'is_active' => 'boolean',
    ];

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class, 'collector_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'processed_by');
    }

    public function createdSuppliers(): HasMany
    {
        return $this->hasMany(Supplier::class, 'created_by');
    }

    public function syncQueue(): HasMany
    {
        return $this->hasMany(SyncQueue::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    // RBAC methods
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    public function isCollector(): bool
    {
        return $this->role === 'collector';
    }

    // ABAC methods
    public function hasUserAttribute(string $key, $value = null): bool
    {
        if (!is_array($this->attributes)) {
            return false;
        }

        if ($value === null) {
            return isset($this->attributes[$key]);
        }

        return ($this->attributes[$key] ?? null) === $value;
    }

    public function getUserAttribute(string $key, $default = null)
    {
        return $this->attributes[$key] ?? $default;
    }
}
