<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'supplier_id',
        'rate',
        'effective_from',
        'effective_to',
        'is_active',
        'notes',
        'created_by',
        'updated_by',
        'last_sync_at',
        'version',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean',
        'last_sync_at' => 'datetime',
        'version' => 'integer',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    // Relationships
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Check if rate is valid for a given date
    public function isValidForDate(string $date): bool
    {
        $checkDate = \Carbon\Carbon::parse($date);
        $effectiveFrom = \Carbon\Carbon::parse($this->effective_from);
        
        if ($checkDate->lt($effectiveFrom)) {
            return false;
        }
        
        if ($this->effective_to) {
            $effectiveTo = \Carbon\Carbon::parse($this->effective_to);
            return $checkDate->lte($effectiveTo);
        }
        
        return true;
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
