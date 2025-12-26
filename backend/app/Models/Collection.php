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
        'version'
    ];

    protected $casts = [
        'collection_date' => 'date',
        'quantity' => 'decimal:3',
        'rate_applied' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'version' => 'integer'
    ];

    /**
     * Get the supplier for this collection
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the product for this collection
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who recorded this collection
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product rate applied to this collection
     */
    public function productRate(): BelongsTo
    {
        return $this->belongsTo(ProductRate::class);
    }

    /**
     * Calculate and update the total amount
     */
    public function calculateTotal(): void
    {
        if ($this->quantity && $this->rate_applied) {
            $this->total_amount = $this->quantity * $this->rate_applied;
        }
    }
}
