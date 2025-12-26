<?php

namespace Src\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PaymentModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'payments';

    protected $fillable = [
        'uuid',
        'payment_reference',
        'collection_id',
        'rate_id',
        'payer_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'notes',
        'payment_date',
        'processed_at',
        'is_automated',
        'metadata',
        'version',
        'created_by',
        'updated_by',
        'synced_at',
        'device_id',
        'idempotency_key',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_automated' => 'boolean',
        'metadata' => 'array',
        'version' => 'integer',
        'payment_date' => 'datetime',
        'processed_at' => 'datetime',
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
            if (empty($model->payment_reference)) {
                $model->payment_reference = 'PAY-' . strtoupper(Str::random(10));
            }
        });
    }

    public function collection()
    {
        return $this->belongsTo(CollectionModel::class, 'collection_id');
    }

    public function rate()
    {
        return $this->belongsTo(RateModel::class, 'rate_id');
    }

    public function payer()
    {
        return $this->belongsTo(\App\Models\User::class, 'payer_id');
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }
}
