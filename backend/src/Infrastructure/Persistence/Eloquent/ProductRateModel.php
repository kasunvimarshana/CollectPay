<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ProductRate Eloquent Model
 */
class ProductRateModel extends Model
{
    use HasUuids;

    protected $table = 'product_rates';
    
    protected $keyType = 'string';
    
    public $incrementing = false;

    protected $fillable = [
        'id',
        'product_id',
        'price',
        'currency',
        'unit',
        'effective_from',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'effective_from' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }
}
