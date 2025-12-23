<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Supplier extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'email',
        'phone_number',
        'latitude',
        'longitude',
        'address',
        'metadata',
        'is_active',
        'created_by',
        'updated_by',
        'synced_at',
        'device_id',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'metadata' => 'array',
            'is_active' => 'boolean',
            'synced_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
            if (empty($model->version)) {
                $model->version = 1;
            }
        });

        static::updating(function ($model) {
            $model->version++;
        });
    }

    /**
     * Get the user who created this supplier.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this supplier.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the collections for this supplier.
     */
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Get the payments for this supplier.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the payment transactions for this supplier.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Calculate total owed by supplier (from collections)
     */
    public function getTotalOwedAttribute(): float
    {
        return $this->collections()
            ->where('status', 'confirmed')
            ->sum('total_amount');
    }

    /**
     * Calculate total paid to supplier
     */
    public function getTotalPaidAttribute(): float
    {
        return $this->payments()
            ->where('status', 'confirmed')
            ->sum('amount');
    }

    /**
     * Calculate outstanding balance
     */
    public function getBalanceAttribute(): float
    {
        return $this->total_owed - $this->total_paid;
    }
}
