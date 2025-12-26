<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'supplier_id',
        'amount',
        'payment_type',
        'payment_method',
        'reference_number',
        'payment_date',
        'notes',
        'metadata',
        'created_by',
        'device_id',
        'synced_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'payment_date' => 'datetime',
        'synced_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (empty($payment->uuid)) {
                $payment->uuid = \Illuminate\Support\Str::uuid();
            }
        });
    }
}
