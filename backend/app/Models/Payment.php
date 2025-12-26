<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'supplier_id',
        'user_id',
        'payment_date',
        'amount',
        'type',
        'reference_number',
        'notes',
        'version'
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
        'version' => 'integer'
    ];

    /**
     * Get the supplier for this payment
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the user who recorded this payment
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
