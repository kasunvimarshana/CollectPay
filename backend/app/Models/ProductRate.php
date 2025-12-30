<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductRate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'rate',
        'unit',
        'effective_from',
        'effective_to',
        'is_active',
        'notes',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'effective_from' => 'date',
            'effective_to' => 'date',
            'is_active' => 'boolean',
            'rate' => 'decimal:4',
        ];
    }

    /**
     * Get the product for this rate.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get collections using this rate.
     */
    public function collections()
    {
        return $this->hasMany(Collection::class, 'rate_id');
    }

    /**
     * Check if rate is currently active.
     */
    public function isCurrentlyActive(): bool
    {
        $today = now()->toDateString();

        return $this->is_active
            && $this->effective_from <= $today
            && ($this->effective_to === null || $this->effective_to >= $today);
    }

    /**
     * Deactivate this rate.
     */
    public function deactivate()
    {
        $this->is_active = false;
        $this->save();
    }
}
