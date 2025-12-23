<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierBalance extends Model
{
    protected $fillable = [
        'supplier_id',
        'total_collections',
        'total_payments',
        'balance',
        'advance_balance',
        'last_collection_at',
        'last_payment_at',
    ];

    protected $casts = [
        'total_collections' => 'decimal:2',
        'total_payments' => 'decimal:2',
        'balance' => 'decimal:2',
        'advance_balance' => 'decimal:2',
        'last_collection_at' => 'datetime',
        'last_payment_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function recalculate(): void
    {
        $totalCollections = $this->supplier->collections()->sum('amount');
        $totalPayments = $this->supplier->payments()->sum('amount');
        
        $this->update([
            'total_collections' => $totalCollections,
            'total_payments' => $totalPayments,
            'balance' => $totalCollections - $totalPayments,
            'last_collection_at' => $this->supplier->collections()->latest('collected_at')->first()?->collected_at,
            'last_payment_at' => $this->supplier->payments()->latest('payment_date')->first()?->payment_date,
        ]);
    }
}
