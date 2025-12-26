<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Collection extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'supplier_id',
        'product_id',
        'user_id',
        'product_rate_id',
        'collection_date',
        'quantity',
        'unit',
        'rate_applied',
        'total_amount',
        'notes',
        'metadata',
        'version',
    ];

    protected $casts = [
        'collection_date' => 'date',
        'quantity' => 'decimal:3',
        'rate_applied' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function productRate(): BelongsTo
    {
        return $this->belongsTo(ProductRate::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($collection) {
            if (!$collection->rate_applied && $collection->product_id && $collection->unit) {
                $rate = Product::find($collection->product_id)
                    ->getCurrentRate($collection->unit, $collection->collection_date);
                if ($rate) {
                    $collection->rate_applied = $rate->rate;
                    $collection->product_rate_id = $rate->id;
                }
            }
            
            if ($collection->quantity && $collection->rate_applied) {
                $collection->total_amount = $collection->quantity * $collection->rate_applied;
            }
        });

        static::updating(function ($collection) {
            if ($collection->quantity && $collection->rate_applied) {
                $collection->total_amount = $collection->quantity * $collection->rate_applied;
            }
        });
    }
}
