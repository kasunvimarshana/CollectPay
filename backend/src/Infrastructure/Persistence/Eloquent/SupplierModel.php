<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * Supplier Eloquent Model
 * 
 * Infrastructure layer - persistence implementation
 * Maps domain entity to database
 */
class SupplierModel extends Model
{
    use HasUuids;

    protected $table = 'suppliers';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'code',
        'email',
        'phone',
        'address',
        'active',
        'version',
    ];

    protected $casts = [
        'active' => 'boolean',
        'version' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
