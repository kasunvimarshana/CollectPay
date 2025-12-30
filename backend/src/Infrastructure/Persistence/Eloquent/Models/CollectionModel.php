<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * Collection Eloquent Model
 */
class CollectionModel extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'collections';
    
    protected $keyType = 'string';
    
    public $incrementing = false;

    protected $fillable = [
        'id',
        'supplier_id',
        'product_id',
        'rate_id',
        'quantity_value',
        'quantity_unit',
        'total_amount',
        'total_amount_currency',
        'collection_date',
        'collected_by',
        'notes',
    ];

    protected $casts = [
        'quantity_value' => 'decimal:4',
        'total_amount' => 'decimal:4',
        'collection_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(SupplierModel::class, 'supplier_id');
    }

    public function product()
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }

    public function rate()
    {
        return $this->belongsTo(RateModel::class, 'rate_id');
    }

    public function collector()
    {
        return $this->belongsTo(\App\Models\User::class, 'collected_by');
    }
}
