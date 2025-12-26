<?php

namespace Src\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class CollectionModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'collections';

    protected $fillable = [
        'uuid',
        'name',
        'description',
        'created_by',
        'updated_by',
        'status',
        'metadata',
        'version',
        'synced_at',
        'device_id',
    ];

    protected $casts = [
        'metadata' => 'array',
        'version' => 'integer',
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
        return $this->hasMany(PaymentModel::class, 'collection_id');
    }

    public function rates()
    {
        return $this->hasMany(RateModel::class, 'collection_id');
    }
}
