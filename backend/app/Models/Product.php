<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'base_unit',
        'allowed_units',
        'status',
        'metadata',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'allowed_units' => 'array',
            'metadata' => 'array',
        ];
    }

    /**
     * Get the rates for this product.
     */
    public function rates()
    {
        return $this->hasMany(ProductRate::class);
    }

    /**
     * Get the active rates for this product.
     */
    public function activeRates()
    {
        return $this->rates()->where('is_active', true);
    }

    /**
     * Get the current rate for a specific date and unit.
     */
    public function getCurrentRate($date = null, $unit = null)
    {
        $date = $date ?? now()->toDateString();
        $unit = $unit ?? $this->base_unit;

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
     * Get the collections for this product.
     */
    public function collections()
    {
        return $this->hasMany(Collection::class);
    }
}
