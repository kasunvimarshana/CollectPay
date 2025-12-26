<?php

namespace App\Domain\Payment\Models;

use App\Domain\Shared\BaseModel;
use App\Domain\User\Models\User;
use App\Domain\Supplier\Models\Supplier;
use App\Domain\Collection\Models\Collection;

class Payment extends BaseModel
{
    protected $fillable = [
        'reference_number',
        'supplier_id',
        'payment_type',
        'amount',
        'currency',
        'payment_method',
        'transaction_reference',
        'bank_name',
        'check_number',
        'period_start',
        'period_end',
        'total_collection_amount',
        'previous_advances',
        'previous_partials',
        'adjustments',
        'balance_due',
        'payment_date',
        'notes',
        'paid_by',
        'approved_by',
        'approved_at',
        'status',
        'client_id',
        'version',
        'synced_at',
        'is_dirty',
        'sync_status',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'total_collection_amount' => 'decimal:4',
        'previous_advances' => 'decimal:4',
        'previous_partials' => 'decimal:4',
        'adjustments' => 'decimal:4',
        'balance_due' => 'decimal:4',
        'payment_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'approved_at' => 'datetime',
        'is_dirty' => 'boolean',
        'version' => 'integer',
        'synced_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Encrypted attributes
    public function getEncryptedAttributes(): array
    {
        return ['check_number', 'transaction_reference'];
    }

    // Relationships
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function paidBy()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function collections()
    {
        return $this->belongsToMany(Collection::class, 'collection_payment')
            ->withPivot('amount_applied')
            ->withTimestamps();
    }

    // Business logic
    public function isAdvance(): bool
    {
        return $this->payment_type === 'advance';
    }

    public function isPartial(): bool
    {
        return $this->payment_type === 'partial';
    }

    public function isSettlement(): bool
    {
        return $this->payment_type === 'settlement';
    }

    public function calculateSettlement(): void
    {
        if (!$this->isSettlement() || !$this->supplier_id) {
            return;
        }

        $startDate = $this->period_start?->toDateString();
        $endDate = $this->period_end?->toDateString();

        // Get total collections for period
        $this->total_collection_amount = $this->supplier->getTotalCollectionsAmount($startDate, $endDate);

        // Get previous advances for period
        $this->previous_advances = (float) $this->supplier->payments()
            ->where('payment_type', 'advance')
            ->whereIn('status', ['approved', 'completed'])
            ->when($startDate, fn($q) => $q->where('payment_date', '>=', $startDate))
            ->when($endDate, fn($q) => $q->where('payment_date', '<=', $endDate))
            ->sum('amount');

        // Get previous partial payments for period
        $this->previous_partials = (float) $this->supplier->payments()
            ->where('payment_type', 'partial')
            ->whereIn('status', ['approved', 'completed'])
            ->when($startDate, fn($q) => $q->where('payment_date', '>=', $startDate))
            ->when($endDate, fn($q) => $q->where('payment_date', '<=', $endDate))
            ->sum('amount');

        // Calculate balance due
        $this->balance_due = $this->total_collection_amount 
            - $this->previous_advances 
            - $this->previous_partials 
            + ($this->adjustments ?? 0);

        // Set amount to balance due if not specified
        if (empty($this->amount)) {
            $this->amount = max(0, $this->balance_due);
        }
    }

    // Status management
    public function approve(User $approver): void
    {
        $this->approved_by = $approver->id;
        $this->approved_at = now();
        $this->status = 'approved';
        $this->save();
    }

    public function complete(): void
    {
        $this->status = 'completed';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->whereIn('status', ['approved', 'completed']);
    }

    public function scopeForSupplier($query, string $supplierId)
    {
        return $query->where('supplier_id', $supplierId);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('payment_type', $type);
    }

    public function scopeBetweenDates($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    // Lifecycle hooks
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (empty($payment->reference_number)) {
                $payment->reference_number = self::generateReferenceNumber('PAY');
            }
            
            // Calculate settlement amounts
            if ($payment->payment_type === 'settlement') {
                $payment->calculateSettlement();
            }
        });

        static::updating(function ($payment) {
            // Recalculate settlement if period changed
            if ($payment->payment_type === 'settlement' && 
                $payment->isDirty(['period_start', 'period_end', 'adjustments'])) {
                $payment->calculateSettlement();
            }
        });
    }
}
