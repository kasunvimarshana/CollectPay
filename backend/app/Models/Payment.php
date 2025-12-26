<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'supplier_id',
        'payment_date',
        'amount',
        'payment_type',
        'payment_method',
        'reference_number',
        'notes',
        'allocation',
        'is_synced',
        'synced_at',
        'processed_by',
        'created_by',
        'updated_by',
        'version',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
        'allocation' => 'array',
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
        });

        static::updating(function ($model) {
            $model->version++;
        });
    }

    // Relationships
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
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
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('payment_type', $type);
    }

    // Helpers
    public function markAsSynced()
    {
        $this->update([
            'is_synced' => true,
            'synced_at' => now(),
        ]);
    }

    public function allocateToCollections(array $collections)
    {
        // Store collection IDs and amounts this payment covers
        $this->allocation = $collections;
        $this->save();
    }
}
