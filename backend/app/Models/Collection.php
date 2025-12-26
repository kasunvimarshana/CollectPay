<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
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
        'total_amount',
        'notes',
        'is_synced',
        'synced_at',
        'collected_by',
        'created_by',
        'updated_by',
        'version',
    ];

    protected $casts = [
        'collection_date' => 'date',
        'quantity' => 'decimal:3',
        'rate_applied' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'is_synced' => 'boolean',
        'synced_at' => 'datetime',
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
            
            // Auto-calculate total if not provided
            if ($model->quantity && $model->rate_applied && !$model->total_amount) {
                $model->total_amount = $model->quantity * $model->rate_applied;
            }
        });

        static::updating(function ($model) {
            $model->version++;
            
            // Recalculate total if quantity or rate changes
            if ($model->isDirty(['quantity', 'rate_applied'])) {
                $model->total_amount = $model->quantity * $model->rate_applied;
            }
        });
    }

    // Relationships
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function rate()
    {
        return $this->belongsTo(Rate::class);
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeSynced($query)
    {
        return $query->where('is_synced', true);
    }

    public function scopePending($query)
    {
        return $query->where('is_synced', false);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('collection_date', [$startDate, $endDate]);
    }

    // Helpers
    public function markAsSynced()
    {
        $this->update([
            'is_synced' => true,
            'synced_at' => now(),
        ]);
    }
}
