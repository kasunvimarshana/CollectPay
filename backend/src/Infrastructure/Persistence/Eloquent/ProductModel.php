<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Product Eloquent Model
 * 
 * Infrastructure layer - persistence implementation
 * Maps domain entity to database
 */
class ProductModel extends Model
{
    use HasUuids;

    protected $table = 'products';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'code',
        'unit',
        'description',
        'active',
        'version',
    ];

    protected $casts = [
        'active' => 'boolean',
        'version' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function rates(): HasMany
    {
        return $this->hasMany(ProductRateModel::class, 'product_id');
    }

    public function collections(): HasMany
    {
        return $this->hasMany(CollectionModel::class, 'product_id');
    }
}
