<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Collection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'supplier_id',
        'product_id',
        'rate_id',
        'quantity',
        'unit',
        'rate_at_collection',
        'total_value',
        'collected_at',
        'notes',
        'sync_status',
        'metadata',
        'collected_by',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'rate_at_collection' => 'decimal:4',
        'total_value' => 'decimal:2',
        'collected_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($collection) {
            if (empty($collection->uuid)) {
                $collection->uuid = (string) Str::uuid();
            }

            // Auto-fetch and set rate if not provided
            if (empty($collection->rate_at_collection) && $collection->product_id) {
                $rate = $collection->product->getCurrentRate($collection->supplier_id, $collection->collected_at);
                if ($rate) {
                    $collection->rate_id = $rate->id;
                    $collection->rate_at_collection = $rate->rate_value;
                }
            }

            // Calculate total value
            if (!empty($collection->quantity) && !empty($collection->rate_at_collection)) {
                $collection->total_value = $collection->quantity * $collection->rate_at_collection;
            }
        });

        static::saving(function ($collection) {
            $collection->version++;
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

    public function rate()
    {
        return $this->belongsTo(Rate::class);
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
