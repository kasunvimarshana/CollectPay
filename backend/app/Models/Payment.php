<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'supplier_id',
        'amount',
        'type',
        'payment_date',
        'notes',
        'reference_number',
        'user_id',
        'idempotency_key',
        'version',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'version' => 'integer',
        'payment_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
