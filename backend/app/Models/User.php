<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'attributes',
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
        ];
    }

    public function roles() { return $this->belongsToMany(Role::class); }

    public function hasRole(string $name): bool
    {
        return $this->roles()->where('name', $name)->exists();
    }

    public function hasAnyRole(array $names): bool
    {
        return $this->roles()->whereIn('name', $names)->exists();
    }

    public function attr(string $key, mixed $default = null): mixed
    {
        $attrs = $this->getAttribute('attributes') ?? [];
        return data_get($attrs, $key, $default);
    }

    public function canAccessSupplier(string $supplierId): bool
    {
        if ($this->hasAnyRole(['admin','manager'])) return true;
        if ((bool) $this->attr('allow_all_suppliers', false)) return true;
        $ids = (array) $this->attr('allowed_supplier_ids', []);
        return in_array($supplierId, $ids, true);
    }
}
