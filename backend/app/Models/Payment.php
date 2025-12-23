<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'supplier_id',
        'user_id',
        'amount',
        'payment_type',
        'payment_method',
        'reference_number',
        'payment_date',
        'notes',
        'device_id',
        'sync_status',
        'version',
        'server_timestamp',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'server_timestamp' => 'datetime',
        'version' => 'integer',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($payment) {
            $payment->version = ($payment->version ?? 0) + 1;
        });
    }
}
