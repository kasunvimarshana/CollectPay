<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * Rate Eloquent Model
 */
class RateModel extends Model
{
    use HasUuids;

    protected $table = 'rates';
    
    protected $keyType = 'string';
    
    public $incrementing = false;

    protected $fillable = [
        'id',
        'product_id',
        'rate_per_unit',
        'currency',
        'unit',
        'effective_from',
        'effective_to',
        'is_active',
    ];

    protected $casts = [
        'rate_per_unit' => 'decimal:4',
        'is_active' => 'boolean',
        'effective_from' => 'datetime',
        'effective_to' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }

    public function collections()
    {
        return $this->hasMany(CollectionModel::class, 'rate_id');
    }
}
