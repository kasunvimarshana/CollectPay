<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class CollectionItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'collection_id',
        'product_id',
        'product_rate_id',
        'quantity',
        'unit',
        'rate',
        'amount',
        'notes',
        'synced_at',
        'device_id',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'rate' => 'decimal:2',
            'amount' => 'decimal:2',
            'synced_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
            
            if (empty($model->version)) {
                $model->version = 1;
            }

            // Auto-fetch and apply rate if not provided
            if (empty($model->rate) && !empty($model->product_id) && !empty($model->unit)) {
                $product = Product::find($model->product_id);
                if ($product) {
                    $activeRate = $product->getActiveRate($model->unit, $model->collection->collected_at ?? now());
                    if ($activeRate) {
                        $model->rate = $activeRate->rate;
                        $model->product_rate_id = $activeRate->id;
                    }
                }
            }

            // Calculate amount
            if (isset($model->quantity) && isset($model->rate)) {
                $model->amount = $model->quantity * $model->rate;
            }
        });

        static::updating(function ($model) {
            $model->version++;
            
            // Recalculate amount if quantity or rate changed
            if ($model->isDirty(['quantity', 'rate'])) {
                $model->amount = $model->quantity * $model->rate;
            }
        });

        // Update collection total when item changes
        static::saved(function ($model) {
            if ($model->collection) {
                $model->collection->recalculateTotal();
            }
        });

        static::deleted(function ($model) {
            if ($model->collection) {
                $model->collection->recalculateTotal();
            }
        });
    }

    /**
     * Get the collection that owns this item.
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    /**
     * Get the product for this item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the rate used for this item.
     */
    public function productRate(): BelongsTo
    {
        return $this->belongsTo(ProductRate::class);
    }
}
