<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * Payment Eloquent Model
 */
class PaymentModel extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'payments';
    
    protected $keyType = 'string';
    
    public $incrementing = false;

    protected $fillable = [
        'id',
        'supplier_id',
        'type',
        'amount',
        'currency',
        'payment_date',
        'paid_by',
        'reference_number',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'payment_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(SupplierModel::class, 'supplier_id');
    }

    public function payer()
    {
        return $this->belongsTo(\App\Models\User::class, 'paid_by');
    }
}
