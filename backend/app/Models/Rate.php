<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rate extends Model
{
    use HasUuids;
    use SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'product_id',
        'rate_per_base',
        'effective_from',
        'effective_to',
        'set_by_user_id',
        'version',
    ];

    protected $casts = [
        'rate_per_base' => 'decimal:6',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'version' => 'integer',
        'deleted_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function setBy()
    {
        return $this->belongsTo(User::class, 'set_by_user_id');
    }
}
