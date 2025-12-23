<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'unit',
        'category',
        'metadata',
        'is_active',
        'created_by',
        'updated_by',
        'last_sync_at',
        'version',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'last_sync_at' => 'datetime',
        'version' => 'integer',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    // Relationships
    public function rates(): HasMany
    {
        return $this->hasMany(Rate::class);
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Get current active rate for a supplier or global
    public function getCurrentRate(?int $supplierId = null, ?string $date = null): ?Rate
    {
        $date = $date ?? now()->format('Y-m-d');
        
        return $this->rates()
            ->where('is_active', true)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            })
            ->where(function ($query) use ($supplierId) {
                if ($supplierId) {
                    $query->where('supplier_id', $supplierId);
                } else {
                    $query->whereNull('supplier_id');
                }
            })
            ->orderBy('effective_from', 'desc')
            ->first();
    }

    // Version control for optimistic locking
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if ($model->isDirty() && !$model->wasRecentlyCreated) {
                $model->version++;
            }
        });
    }
}
