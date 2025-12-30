<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Collection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'supplier_id',
        'product_id',
        'collected_by',
        'quantity',
        'unit',
        'rate',
        'rate_id',
        'total_amount',
        'collection_date',
        'collection_time',
        'notes',
        'metadata',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:4',
            'rate' => 'decimal:4',
            'total_amount' => 'decimal:4',
            'collection_date' => 'date',
            'metadata' => 'array',
        ];
    }

    /**
     * Get the supplier for this collection.
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the product for this collection.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who collected this.
     */
    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    /**
     * Get the rate used for this collection.
     */
    public function productRate()
    {
        return $this->belongsTo(ProductRate::class, 'rate_id');
    }

    /**
     * Calculate total amount before saving.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($collection) {
            $collection->total_amount = $collection->quantity * $collection->rate;
        });

        static::updating(function ($collection) {
            if ($collection->isDirty(['quantity', 'rate'])) {
                $collection->total_amount = $collection->quantity * $collection->rate;
            }
        });
    }
}
