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
        'user_id',
        'quantity',
        'unit',
        'rate',
        'total_amount',
        'collection_date',
        'notes',
        'device_id',
        'sync_status',
        'conflict_resolution',
        'version',
        'server_timestamp',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'rate' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'collection_date' => 'datetime',
        'server_timestamp' => 'datetime',
        'version' => 'integer',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function calculateTotalAmount()
    {
        $this->total_amount = $this->quantity * $this->rate;
        return $this->total_amount;
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($collection) {
            if ($collection->isDirty(['quantity', 'rate'])) {
                $collection->calculateTotalAmount();
            }
            $collection->version = ($collection->version ?? 0) + 1;
        });
    }
}
