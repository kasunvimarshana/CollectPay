<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ProductRate extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'product_id',
        'unit',
        'rate',
        'min_quantity',
        'max_quantity',
        'valid_from',
        'valid_to',
        'version',
        'is_active',
        'created_by',
        'updated_by',
        'synced_at',
        'device_id',
    ];

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:2',
            'min_quantity' => 'decimal:2',
            'max_quantity' => 'decimal:2',
            'valid_from' => 'datetime',
            'valid_to' => 'datetime',
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
            
            // Auto-increment version for same product/unit
            if (empty($model->version)) {
                $latestVersion = static::where('product_id', $model->product_id)
                    ->where('unit', $model->unit)
                    ->max('version');
                $model->version = ($latestVersion ?? 0) + 1;
            }

            // Set valid_from to now if not set
            if (empty($model->valid_from)) {
                $model->valid_from = now();
            }

            // Close previous rate's valid_to when creating new one
            if ($model->is_active) {
                static::where('product_id', $model->product_id)
                    ->where('unit', $model->unit)
                    ->where('is_active', true)
                    ->whereNull('valid_to')
                    ->update(['valid_to' => $model->valid_from, 'is_active' => false]);
            }
        });
    }

    /**
     * Get the product that owns this rate.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who created this rate.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if this rate is currently active
     */
    public function isCurrentlyActive(): bool
    {
        $now = now();
        return $this->is_active
            && $this->valid_from <= $now
            && (is_null($this->valid_to) || $this->valid_to >= $now);
    }

    /**
     * Scope to get only active rates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get rates valid at a specific time
     */
    public function scopeValidAt($query, $timestamp = null)
    {
        $timestamp = $timestamp ?? now();
        
        return $query->where('valid_from', '<=', $timestamp)
            ->where(function ($q) use ($timestamp) {
                $q->whereNull('valid_to')
                  ->orWhere('valid_to', '>=', $timestamp);
            });
    }
}
