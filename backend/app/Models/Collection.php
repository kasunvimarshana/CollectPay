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
        'collection_number',
        'supplier_id',
        'product_id',
        'collector_id',
        'quantity',
        'unit',
        'quantity_in_base_unit',
        'rate_id',
        'rate_applied',
        'amount',
        'collected_at',
        'notes',
        'metadata',
        'client_uuid',
        'is_synced',
        'synced_at',
        'sync_version',
        'device_id',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'quantity_in_base_unit' => 'decimal:3',
        'rate_applied' => 'decimal:2',
        'amount' => 'decimal:2',
        'collected_at' => 'datetime',
        'synced_at' => 'datetime',
        'is_synced' => 'boolean',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($collection) {
            if (empty($collection->collection_number)) {
                $collection->collection_number = 'COL-' . date('Ymd') . '-' . strtoupper(uniqid());
            }
            
            // Convert quantity to base unit
            $collection->quantity_in_base_unit = self::convertToBaseUnit(
                $collection->quantity,
                $collection->unit
            );
            
            // Calculate amount if not set
            if (empty($collection->amount)) {
                $collection->amount = $collection->quantity_in_base_unit * $collection->rate_applied;
            }
        });
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function collector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collector_id');
    }

    public function rate(): BelongsTo
    {
        return $this->belongsTo(ProductRate::class, 'rate_id');
    }

    public static function convertToBaseUnit(float $quantity, string $unit): float
    {
        return match($unit) {
            'gram' => $quantity / 1000,
            'kilogram' => $quantity,
            'milliliter' => $quantity / 1000,
            'liter' => $quantity,
            default => $quantity,
        };
    }

    public static function convertFromBaseUnit(float $quantity, string $unit): float
    {
        return match($unit) {
            'gram' => $quantity * 1000,
            'kilogram' => $quantity,
            'milliliter' => $quantity * 1000,
            'liter' => $quantity,
            default => $quantity,
        };
    }
}
