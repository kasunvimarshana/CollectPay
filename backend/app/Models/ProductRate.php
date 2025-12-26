<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductRate extends Model
{
    protected $fillable = [
        'product_id',
        'rate',
        'unit',
        'effective_from',
        'effective_to',
        'is_active'
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean'
    ];

    /**
     * Get the product that owns this rate
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get collections that use this rate
     */
    public function collections()
    {
        return $this->hasMany(\App\Models\Collection::class);
    }
}
