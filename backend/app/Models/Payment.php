<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

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
        'status',
        'sync_status',
        'metadata',
        'paid_by',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($payment) {
            if (empty($payment->uuid)) {
                $payment->uuid = (string) Str::uuid();
            }
        });

        static::saving(function ($payment) {
            $payment->version++;
        });
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function payer()
    {
        return $this->belongsTo(User::class, 'paid_by');
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
