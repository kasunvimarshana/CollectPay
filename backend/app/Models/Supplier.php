<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'email',
        'phone',
        'secondary_phone',
        'latitude',
        'longitude',
        'address',
        'village',
        'district',
        'metadata',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($supplier) {
            if (empty($supplier->code)) {
                $supplier->code = 'SUP-' . strtoupper(uniqid());
            }
        });
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function balance(): HasOne
    {
        return $this->hasOne(SupplierBalance::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function calculateBalance(): float
    {
        $totalCollections = $this->collections()->sum('amount');
        $totalPayments = $this->payments()->sum('amount');
        return $totalCollections - $totalPayments;
    }
}
