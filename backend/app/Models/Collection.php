<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Collection extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'supplier_id',
        'product_id',
        'product_rate_id',
        'collection_date',
        'quantity',
        'unit',
        'rate_applied',
        'total_amount',
        'notes',
        'collected_by',
    ];

    protected $casts = [
        'collection_date' => 'date',
        'quantity' => 'decimal:3',
        'rate_applied' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($collection) {
            if (!$collection->rate_applied && $collection->product_id) {
                $product = Product::find($collection->product_id);
                $rate = $product?->getCurrentRate($collection->unit, $collection->collection_date);
                
                if ($rate) {
                    $collection->product_rate_id = $rate->id;
                    $collection->rate_applied = $rate->rate;
                }
            }

            if ($collection->rate_applied && $collection->quantity) {
                $collection->total_amount = $collection->quantity * $collection->rate_applied;
            }
        });

        static::updating(function ($collection) {
            if ($collection->rate_applied && $collection->quantity) {
                $collection->total_amount = $collection->quantity * $collection->rate_applied;
            }
        });
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productRate()
    {
        return $this->belongsTo(ProductRate::class);
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }
}
