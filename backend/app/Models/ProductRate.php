<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductRate extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'product_id',
        'unit',
        'rate',
        'effective_date',
        'end_date',
        'is_active',
        'metadata',
        'version',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'effective_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }
}
