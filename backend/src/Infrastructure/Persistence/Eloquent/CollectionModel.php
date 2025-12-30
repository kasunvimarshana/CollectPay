<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Collection Eloquent Model
 */
class CollectionModel extends Model
{
    use HasUuids;

    protected $table = 'collections';
    
    protected $keyType = 'string';
    
    public $incrementing = false;

    protected $fillable = [
        'id',
        'supplier_id',
        'product_id',
        'user_id',
        'quantity_value',
        'quantity_unit',
        'rate_price',
        'rate_currency',
        'rate_unit',
        'rate_effective_from',
        'total_amount',
        'total_currency',
        'collection_date',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'quantity_value' => 'decimal:3',
        'rate_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'collection_date' => 'datetime',
        'rate_effective_from' => 'datetime',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(SupplierModel::class, 'supplier_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }
}
