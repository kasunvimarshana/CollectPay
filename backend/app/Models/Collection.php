<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Collection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'collection_number',
        'supplier_id',
        'product_id',
        'collector_id',
        'collection_date',
        'quantity',
        'unit',
        'rate_id',
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

    /**
     * Get the supplier for this collection
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the product for this collection
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the collector (user) for this collection
     */
    public function collector()
    {
        return $this->belongsTo(User::class, 'collector_id');
    }

    /**
     * Get the rate used for this collection
     */
    public function rate()
    {
        return $this->belongsTo(ProductRate::class, 'rate_id');
    }

    /**
     * Get all payments allocated to this collection
     */
    public function payments()
    {
        return $this->belongsToMany(Payment::class, 'collection_payment')
            ->withPivot('allocated_amount')
            ->withTimestamps();
    }

    /**
     * Get audit logs for this collection
     */
    public function auditLogs()
    {
        return $this->hasMany(CollectionAuditLog::class);
    }

    /**
     * Calculate total amount based on quantity and rate
     */
    public function calculateTotalAmount()
    {
        return $this->quantity * $this->rate_applied;
    }

    /**
     * Get total allocated payments for this collection
     */
    public function totalAllocatedPayments()
    {
        return $this->payments()->sum('collection_payment.allocated_amount');
    }

    /**
     * Get outstanding amount for this collection
     */
    public function outstandingAmount()
    {
        return $this->total_amount - $this->totalAllocatedPayments();
    }

    /**
     * Boot method to handle events
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($collection) {
            // Generate collection number if not provided
            if (empty($collection->collection_number)) {
                $collection->collection_number = 'COL-' . date('Ymd') . '-' . str_pad(
                    self::whereDate('created_at', now()->toDateString())->count() + 1,
                    5,
                    '0',
                    STR_PAD_LEFT
                );
            }

            // Calculate total amount
            if (empty($collection->total_amount) && !empty($collection->quantity) && !empty($collection->rate_applied)) {
                $collection->total_amount = $collection->calculateTotalAmount();
            }
        });

        static::updating(function ($collection) {
            // Recalculate total amount if quantity or rate changed
            if ($collection->isDirty(['quantity', 'rate_applied'])) {
                $collection->total_amount = $collection->calculateTotalAmount();
            }
        });
    }
}
