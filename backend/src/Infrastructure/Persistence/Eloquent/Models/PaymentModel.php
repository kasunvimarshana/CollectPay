<?php

namespace Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentModel extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'payments';

    protected $fillable = [
        'id',
        'supplier_id',
        'paid_by',
        'amount',
        'currency',
        'type',
        'method',
        'status',
        'reference_number',
        'notes',
        'payment_date',
        'sync_id',
    ];

    protected $casts = [
        'amount' => 'integer',
        'payment_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(SupplierModel::class, 'supplier_id');
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'paid_by');
    }
}
