<?php

namespace App\Domain\Collection\Models;

use App\Domain\Shared\BaseModel;
use App\Domain\User\Models\User;
use App\Domain\Supplier\Models\Supplier;
use App\Domain\Product\Models\Product;
use App\Domain\Product\Models\ProductRate;
use App\Domain\Payment\Models\Payment;

class Collection extends BaseModel
{
    protected $fillable = [
        'reference_number',
        'supplier_id',
        'product_id',
        'rate_id',
        'quantity',
        'unit',
        'quantity_in_primary_unit',
        'rate_at_collection',
        'rate_currency',
        'gross_amount',
        'collection_date',
        'collection_time',
        'latitude',
        'longitude',
        'quality_grade',
        'quality_deduction_percent',
        'net_amount',
        'notes',
        'collected_by',
        'status',
        'client_id',
        'version',
        'synced_at',
        'is_dirty',
        'sync_status',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'quantity_in_primary_unit' => 'decimal:4',
        'rate_at_collection' => 'decimal:4',
        'gross_amount' => 'decimal:4',
        'net_amount' => 'decimal:4',
        'quality_deduction_percent' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'collection_date' => 'date',
        'is_dirty' => 'boolean',
        'version' => 'integer',
        'synced_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function rate()
    {
        return $this->belongsTo(ProductRate::class, 'rate_id');
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function payments()
    {
        return $this->belongsToMany(Payment::class, 'collection_payment')
            ->withPivot('amount_applied')
            ->withTimestamps();
    }

    // Business logic
    public function calculateAmounts(): void
    {
        // Get rate for calculation
        $rate = $this->rate_at_collection;
        
        if (!$rate && $this->product) {
            $productRate = $this->product->getRateAtDate($this->collection_date->toDateString());
            if ($productRate) {
                $this->rate_id = $productRate->id;
                $this->rate_at_collection = $productRate->rate;
                $this->rate_currency = $productRate->currency;
            }
        }

        // Convert quantity to primary unit
        if ($this->product && $this->unit !== $this->product->primary_unit) {
            $this->quantity_in_primary_unit = $this->product->convertToUnit(
                $this->quantity,
                $this->unit,
                $this->product->primary_unit
            );
        } else {
            $this->quantity_in_primary_unit = $this->quantity;
        }

        // Calculate gross amount
        $this->gross_amount = round($this->quantity_in_primary_unit * ($this->rate_at_collection ?? 0), 4);

        // Apply quality deduction
        $deductionAmount = $this->gross_amount * ($this->quality_deduction_percent / 100);
        $this->net_amount = round($this->gross_amount - $deductionAmount, 4);
    }

    public function getPaidAmount(): float
    {
        return (float) $this->payments()->sum('collection_payment.amount_applied');
    }

    public function getRemainingAmount(): float
    {
        return $this->net_amount - $this->getPaidAmount();
    }

    public function isPaid(): bool
    {
        return $this->getRemainingAmount() <= 0;
    }

    // Status management
    public function confirm(): void
    {
        $this->status = 'confirmed';
        $this->save();
    }

    public function dispute(): void
    {
        $this->status = 'disputed';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    // Scopes
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeForSupplier($query, string $supplierId)
    {
        return $query->where('supplier_id', $supplierId);
    }

    public function scopeForProduct($query, string $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeBetweenDates($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('collection_date', [$startDate, $endDate]);
    }

    public function scopeCollectedBy($query, string $userId)
    {
        return $query->where('collected_by', $userId);
    }

    // Lifecycle hooks
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($collection) {
            if (empty($collection->reference_number)) {
                $collection->reference_number = self::generateReferenceNumber('COL');
            }
            
            // Calculate amounts before saving
            $collection->calculateAmounts();
        });

        static::updating(function ($collection) {
            // Recalculate if quantity or rate changed (but preserve historical rate)
            if ($collection->isDirty(['quantity', 'unit', 'quality_deduction_percent'])) {
                // Don't recalculate rate_at_collection - it's immutable
                $originalRate = $collection->getOriginal('rate_at_collection');
                $collection->calculateAmounts();
                $collection->rate_at_collection = $originalRate;
            }
        });
    }
}
