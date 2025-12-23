<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Collection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'supplier_id',
        'product_id',
        'rate_id',
        'collection_date',
        'quantity',
        'unit',
        'rate_applied',
        'amount',
        'notes',
        'collector_id',
        'created_by',
        'updated_by',
        'last_sync_at',
        'version',
        'sync_status',
    ];

    protected $casts = [
        'collection_date' => 'date',
        'quantity' => 'decimal:3',
        'rate_applied' => 'decimal:2',
        'amount' => 'decimal:2',
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
            
            // Auto-calculate amount if not provided
            if (!$model->amount && $model->quantity && $model->rate_applied) {
                $model->amount = bcmul($model->quantity, $model->rate_applied, 2);
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

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function rate(): BelongsTo
    {
        return $this->belongsTo(Rate::class);
    }

    public function collector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collector_id');
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
        return $query->whereBetween('collection_date', [$from, $to]);
    }
}
