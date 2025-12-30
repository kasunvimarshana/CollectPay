<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rate extends Model
{
    protected $fillable = [
        'product_id',
        'rate',
        'unit',
        'effective_from',
        'effective_to',
        'is_active',
        'version',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the product for this rate
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get collections using this rate
     */
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Check if rate is valid for a given date
     */
    public function isValidFor($date): bool
    {
        $date = $date instanceof \DateTime ? $date : new \DateTime($date);
        $effectiveFrom = new \DateTime($this->effective_from);
        
        if ($date < $effectiveFrom) {
            return false;
        }
        
        if ($this->effective_to) {
            $effectiveTo = new \DateTime($this->effective_to);
            return $date <= $effectiveTo;
        }
        
        return true;
    }
}
