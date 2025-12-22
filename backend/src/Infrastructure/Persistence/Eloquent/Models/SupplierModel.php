<?php

namespace Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupplierModel extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'suppliers';

    protected $fillable = [
        'id',
        'name',
        'contact_number',
        'address',
        'latitude',
        'longitude',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(UserModel::class, 'created_by');
    }

    public function collections(): HasMany
    {
        return $this->hasMany(CollectionModel::class, 'supplier_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PaymentModel::class, 'supplier_id');
    }
}
