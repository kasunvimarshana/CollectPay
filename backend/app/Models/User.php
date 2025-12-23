<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'name',
        'email',
        'password',
        'phone_number',
        'attributes',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'attributes' => 'array',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Boot function to auto-generate UUID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
        ];
    }

    /**
     * Get the roles that belong to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    /**
     * Get all permissions through roles
     */
    public function permissions()
    {
        return $this->roles->map->permissions->flatten()->unique('id');
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles->contains('slug', $roleName);
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission(string $permissionSlug): bool
    {
        return $this->permissions()->contains('slug', $permissionSlug);
    }

    /**
     * Check if user can perform action on resource
     */
    public function can($ability, $resource = null): bool
    {
        if (!$this->is_active) {
            return false;
        }

        // Check permission
        return $this->hasPermission($ability) || parent::can($ability, $resource);
    }

    /**
     * Suppliers created by this user
     */
    public function suppliersCreated(): HasMany
    {
        return $this->hasMany(Supplier::class, 'created_by');
    }

    /**
     * Collections made by this user
     */
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class, 'collected_by');
    }

    /**
     * Payments processed by this user
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'processed_by');
    }

    /**
     * Sync logs for this user
     */
    public function syncLogs(): HasMany
    {
        return $this->hasMany(SyncLog::class);
    }
}
