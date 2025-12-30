<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ProductRate Eloquent Model
 * 
 * Infrastructure layer - persistence implementation
 * Maps domain entity to database
 */
class ProductRateModel extends Model
{
    use HasUuids;

    protected $table = 'product_rates';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id',
        'product_id',
        'rate_amount',
        'currency',
        'effective_from',
        'effective_to',
        'active',
        'created_at',
        'version',
    ];

    protected $casts = [
        'rate_amount' => 'decimal:2',
        'active' => 'boolean',
        'version' => 'integer',
        'effective_from' => 'datetime',
        'effective_to' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }
}
