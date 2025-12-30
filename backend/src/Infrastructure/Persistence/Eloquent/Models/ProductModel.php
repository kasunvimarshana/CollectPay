<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * Product Eloquent Model
 */
class ProductModel extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'products';
    
    protected $keyType = 'string';
    
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'code',
        'description',
        'default_unit',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function rates()
    {
        return $this->hasMany(RateModel::class, 'product_id');
    }

    public function collections()
    {
        return $this->hasMany(CollectionModel::class, 'product_id');
    }
}
