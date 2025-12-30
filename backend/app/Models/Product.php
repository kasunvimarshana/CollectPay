<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'base_unit',
        'supported_units',
        'is_active',
    ];

    protected $casts = [
        'supported_units' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get rates for this product
     */
    public function rates(): HasMany
    {
        return $this->hasMany(Rate::class);
    }

    /**
     * Get collections for this product
     */
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Get the current active rate for a specific date
     */
    public function getCurrentRate($date = null, $unit = null)
    {
        $date = $date ?? now()->toDateString();
        $unit = $unit ?? $this->base_unit;

        return $this->rates()
            ->where('is_active', true)
            ->where('unit', $unit)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            })
            ->orderBy('effective_from', 'desc')
            ->first();
    }

    /**
     * Get rate history
     */
    public function rateHistory($unit = null)
    {
        $query = $this->rates()->orderBy('effective_from', 'desc');
        
        if ($unit) {
            $query->where('unit', $unit);
        }
        
        return $query->get();
    }
}
