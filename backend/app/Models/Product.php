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
        'unit',
        'is_active',
        'version'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'version' => 'integer'
    ];

    /**
     * Get rates for this product
     */
    public function rates(): HasMany
    {
        return $this->hasMany(ProductRate::class);
    }

    /**
     * Get collections for this product
     */
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Get the current active rate for this product
     */
    public function getCurrentRate(string $unit = null)
    {
        $query = $this->rates()
            ->where('is_active', true)
            ->where('effective_from', '<=', now())
            ->where(function($q) {
                $q->whereNull('effective_to')
                  ->orWhere('effective_to', '>=', now());
            });

        if ($unit) {
            $query->where('unit', $unit);
        }

        return $query->orderBy('effective_from', 'desc')->first();
    }
}
