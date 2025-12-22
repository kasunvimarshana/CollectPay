<?php

namespace Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionModel extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'collections';

    protected $fillable = [
        'id',
        'supplier_id',
        'collected_by',
        'product_type',
        'quantity_value',
        'quantity_unit',
        'rate_per_unit',
        'rate_currency',
        'total_amount',
        'total_currency',
        'notes',
        'status',
        'collection_date',
        'sync_id',
    ];

    protected $casts = [
        'quantity_value' => 'decimal:3',
        'rate_per_unit' => 'integer',
        'total_amount' => 'integer',
        'collection_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(SupplierModel::class, 'supplier_id');
    }

    public function collector(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'collected_by');
    }
}
