<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * Supplier Eloquent Model
 */
class SupplierModel extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'suppliers';
    
    protected $keyType = 'string';
    
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'code',
        'address',
        'phone',
        'email',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function collections()
    {
        return $this->hasMany(CollectionModel::class, 'supplier_id');
    }

    public function payments()
    {
        return $this->hasMany(PaymentModel::class, 'supplier_id');
    }
}
