<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Collection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'supplier_id',
        'product_id',
        'user_id',
        'rate_id',
        'collection_date',
        'quantity',
        'unit',
        'rate_applied',
        'total_amount',
        'notes',
        'is_finalized',
        'version',
    ];

    protected $casts = [
        'collection_date' => 'date',
        'quantity' => 'decimal:3',
        'rate_applied' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'is_finalized' => 'boolean',
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
     * Get the user who created this collection
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the rate applied for this collection
     */
    public function rate(): BelongsTo
    {
        return $this->belongsTo(Rate::class);
    }

    /**
     * Check whether a rate has been applied to this collection
     */
    public function hasRate(): bool
    {
        return ! is_null($this->rate_id) && ! is_null($this->rate_applied);
    }

    /**
     * Calculate total amount based on quantity and rate.
     * Returns null when no rate has been assigned yet.
     */
    public function calculateTotal(): ?float
    {
        if (! $this->hasRate()) {
            return null;
        }

        return (float) $this->quantity * (float) $this->rate_applied;
    }
}
