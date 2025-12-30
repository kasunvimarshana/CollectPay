<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Payment Eloquent Model
 * 
 * Infrastructure layer - persistence implementation
 * Maps domain entity to database
 */
class PaymentModel extends Model
{
    use HasUuids;

    protected $table = 'payments';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'supplier_id',
        'amount',
        'currency',
        'type',
        'payment_date',
        'reference',
        'notes',
        'version',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'version' => 'integer',
        'payment_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(SupplierModel::class, 'supplier_id');
    }
}
