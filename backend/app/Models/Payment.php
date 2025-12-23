<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'reference_number',
        'supplier_id',
        'payment_date',
        'amount',
        'payment_type',
        'payment_method',
        'transaction_reference',
        'notes',
        'balance_before',
        'balance_after',
        'processed_by',
        'created_by',
        'updated_by',
        'last_sync_at',
        'version',
        'sync_status',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'last_sync_at' => 'datetime',
        'version' => 'integer',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
            
            if (empty($model->reference_number)) {
                $model->reference_number = 'PAY-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            }
        });

        static::saving(function ($model) {
            if ($model->isDirty() && !$model->wasRecentlyCreated) {
                $model->version++;
            }
        });
    }

    // Relationships
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeSynced($query)
    {
        return $query->where('sync_status', 'synced');
    }

    public function scopePending($query)
    {
        return $query->where('sync_status', 'pending');
    }

    public function scopeForSupplier($query, int $supplierId)
    {
        return $query->where('supplier_id', $supplierId);
    }

    public function scopeForDateRange($query, string $from, string $to)
    {
        return $query->whereBetween('payment_date', [$from, $to]);
    }
}
