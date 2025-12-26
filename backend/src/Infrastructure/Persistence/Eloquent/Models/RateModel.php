<?php

namespace Src\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class RateModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rates';

    protected $fillable = [
        'uuid',
        'name',
        'description',
        'amount',
        'currency',
        'rate_type',
        'collection_id',
        'version',
        'effective_from',
        'effective_until',
        'is_active',
        'metadata',
        'created_by',
        'updated_by',
        'synced_at',
        'device_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'version' => 'integer',
        'is_active' => 'boolean',
        'metadata' => 'array',
        'effective_from' => 'datetime',
        'effective_until' => 'datetime',
        'synced_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function collection()
    {
        return $this->belongsTo(CollectionModel::class, 'collection_id');
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }

    public function payments()
    {
        return $this->hasMany(PaymentModel::class, 'rate_id');
    }
}
