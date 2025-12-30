<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Collection extends Model
{
    protected $fillable = [
        'supplier_id',
        'product_id',
        'quantity_value',
        'quantity_unit',
        'collection_date',
        'rate_id',
        'total_amount',
        'total_currency',
        'notes',
        'version',
        'created_by',
    ];

    protected $casts = [
        'quantity_value' => 'decimal:4',
        'total_amount' => 'decimal:2',
        'collection_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function rate(): BelongsTo
    {
        return $this->belongsTo(ProductRate::class, 'rate_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeByDateRange($query, $from, $to)
    {
        return $query->whereBetween('collection_date', [$from, $to]);
    }
}
