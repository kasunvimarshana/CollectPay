<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'user_id',
        'supplier_id',
        'collection_id',
        'payment_type',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'notes',
        'metadata',
        'synced_at',
        'version',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'metadata' => 'array',
        'synced_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (!$payment->client_id) {
                $payment->client_id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the user who created this payment
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the supplier for this payment
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the collection for this payment
     */
    public function collection()
    {
        return $this->belongsTo(Collection::class);
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
