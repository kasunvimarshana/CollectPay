<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Collection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'user_id',
        'supplier_id',
        'product_id',
        'quantity',
        'unit',
        'rate',
        'amount',
        'collection_date',
        'notes',
        'metadata',
        'synced_at',
        'version',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'rate' => 'decimal:2',
        'amount' => 'decimal:2',
        'collection_date' => 'datetime',
        'metadata' => 'array',
        'synced_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($collection) {
            if (!$collection->client_id) {
                $collection->client_id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the user who created this collection
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

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
     * Get payments for this collection
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Calculate the amount based on quantity and rate
     */
    public function calculateAmount(): float
    {
        return round($this->quantity * $this->rate, 2);
    }

    /**
     * Mark as synced
     */
    public function markAsSynced(): void
    {
        $this->synced_at = now();
        $this->save();
    }
}
