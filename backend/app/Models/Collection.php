<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Collection extends Model
{
    use SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'supplier_id',
        'product_id',
        'quantity',
        'rate_version_id',
        'applied_rate',
        'collection_date',
        'notes',
        'user_id',
        'idempotency_key',
        'version',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'applied_rate' => 'decimal:2',
        'version' => 'integer',
        'collection_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function rateVersion()
    {
        return $this->belongsTo(RateVersion::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
