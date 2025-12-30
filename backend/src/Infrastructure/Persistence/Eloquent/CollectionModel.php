<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Collection Eloquent Model
 * 
 * Infrastructure layer - persistence implementation
 * Maps domain entity to database
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
        'quantity_amount',
        'quantity_unit',
        'applied_rate_amount',
        'currency',
        'total_amount',
        'collection_date',
        'notes',
        'version',
    ];

    protected $casts = [
        'quantity_amount' => 'decimal:2',
        'applied_rate_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'version' => 'integer',
        'collection_date' => 'datetime',
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
}
