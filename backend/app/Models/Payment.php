<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'payment_number',
        'supplier_id',
        'payment_type',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'notes',
        'metadata',
        'paid_by',
        'approved_by',
        'version',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'metadata' => 'array',
    ];

    /**
     * Get the supplier for this payment
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the user who made this payment
     */
    public function payer()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    /**
     * Get the user who approved this payment
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get all collections this payment is allocated to
     */
    public function collections()
    {
        return $this->belongsToMany(Collection::class, 'collection_payment')
            ->withPivot('allocated_amount')
            ->withTimestamps();
    }

    /**
     * Get audit logs for this payment
     */
    public function auditLogs()
    {
        return $this->hasMany(PaymentAuditLog::class);
    }

    /**
     * Get total allocated amount from this payment
     */
    public function totalAllocated()
    {
        return $this->collections()->sum('collection_payment.allocated_amount');
    }

    /**
     * Get unallocated amount
     */
    public function unallocatedAmount()
    {
        return $this->amount - $this->totalAllocated();
    }

    /**
     * Boot method to handle events
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            // Generate payment number if not provided
            if (empty($payment->payment_number)) {
                $payment->payment_number = 'PAY-' . date('Ymd') . '-' . str_pad(
                    self::whereDate('created_at', now()->toDateString())->count() + 1,
                    5,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }
}
