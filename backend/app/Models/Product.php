<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'base_unit',
        'supported_units',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'supported_units' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who created this product
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this product
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all rates for this product
     */
    public function rates()
    {
        return $this->hasMany(ProductRate::class);
    }

    /**
     * Get active rates for this product
     */
    public function activeRates()
    {
        return $this->hasMany(ProductRate::class)->where('is_active', true);
    }

    /**
     * Get all collections for this product
     */
    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Get the current rate for a specific unit
     */
    public function getCurrentRate($unit, $date = null)
    {
        $date = $date ?? now()->toDateString();
        
        return $this->rates()
            ->where('unit', $unit)
            ->where('is_active', true)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                      ->orWhere('effective_to', '>=', $date);
            })
            ->orderBy('effective_from', 'desc')
            ->first();
    }

    /**
     * Get historical rate for a specific date and unit
     */
    public function getRateForDate($unit, $date)
    {
        return $this->rates()
            ->where('unit', $unit)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                      ->orWhere('effective_to', '>=', $date);
            })
            ->orderBy('effective_from', 'desc')
            ->first();
    }
}
