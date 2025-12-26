<?php

namespace App\Domain\Product\Models;

use App\Domain\Shared\BaseModel;
use App\Domain\User\Models\User;

class ProductRate extends BaseModel
{
    protected $fillable = [
        'product_id',
        'rate',
        'currency',
        'effective_from',
        'effective_to',
        'is_current',
        'notes',
        'created_by',
        'client_id',
        'version',
        'synced_at',
        'is_dirty',
        'sync_status',
    ];

    protected $casts = [
        'rate' => 'decimal:4',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_current' => 'boolean',
        'is_dirty' => 'boolean',
        'version' => 'integer',
        'synced_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Business logic
    public function isActiveOnDate(string $date): bool
    {
        $effectiveFrom = $this->effective_from->toDateString();
        $effectiveTo = $this->effective_to?->toDateString();

        return $date >= $effectiveFrom && 
               ($effectiveTo === null || $date <= $effectiveTo);
    }

    public function calculateAmount(float $quantity): float
    {
        return round($quantity * $this->rate, 4);
    }

    // Scopes
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    public function scopeActiveOn($query, string $date)
    {
        return $query
            ->where('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            });
    }

    public function scopeForProduct($query, string $productId)
    {
        return $query->where('product_id', $productId);
    }

    // Lifecycle hooks
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($rate) {
            // If this is set as current, unset other current rates for this product
            if ($rate->is_current) {
                static::where('product_id', $rate->product_id)
                    ->where('is_current', true)
                    ->update(['is_current' => false]);
            }
        });

        static::updating(function ($rate) {
            // If being set as current, unset other current rates
            if ($rate->isDirty('is_current') && $rate->is_current) {
                static::where('product_id', $rate->product_id)
                    ->where('id', '!=', $rate->id)
                    ->where('is_current', true)
                    ->update(['is_current' => false]);
            }
        });
    }
}
