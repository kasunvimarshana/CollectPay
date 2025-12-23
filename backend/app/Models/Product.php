<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'code',
        'description',
        'category',
        'units',
        'default_unit',
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
            'units' => 'array',
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
     * Get the user who created this product.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the rates for this product.
     */
    public function rates(): HasMany
    {
        return $this->hasMany(ProductRate::class);
    }

    /**
     * Get the active rate for this product and unit
     */
    public function getActiveRate(string $unit, $timestamp = null)
    {
        $timestamp = $timestamp ?? now();

        return $this->rates()
            ->where('unit', $unit)
            ->where('is_active', true)
            ->where('valid_from', '<=', $timestamp)
            ->where(function ($query) use ($timestamp) {
                $query->whereNull('valid_to')
                    ->orWhere('valid_to', '>=', $timestamp);
            })
            ->orderBy('version', 'desc')
            ->first();
    }

    /**
     * Get collection items for this product.
     */
    public function collectionItems(): HasMany
    {
        return $this->hasMany(CollectionItem::class);
    }
}
