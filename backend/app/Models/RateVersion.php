<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RateVersion extends Model
{
    use SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'product_id',
        'rate',
        'effective_from',
        'effective_to',
        'user_id',
        'version',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'version' => 'integer',
        'effective_from' => 'datetime',
        'effective_to' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }
}
