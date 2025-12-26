<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rate extends Model
{
    use HasFactory, SoftDeletes;

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
        'is_active' => 'boolean',
        'metadata' => 'json',
        'synced_at' => 'datetime',
        'effective_from' => 'datetime',
        'effective_until' => 'datetime',
    ];

    protected $hidden = [];

    /**
     * Get the collection this rate belongs to.
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    /**
     * Get the user who created this rate.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this rate.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all payments using this rate.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get active rates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->where(function ($q) {
                         $now = now();
                         $q->where('effective_from', '<=', $now)
                           ->where(function ($subQ) {
                               $subQ->whereNull('effective_until')
                                    ->orWhere('effective_until', '>=', now());
                           });
                     });
    }

    /**
     * Get modified rates since a given timestamp.
     */
    public function scopeModifiedSince($query, ?\DateTime $timestamp)
    {
        if ($timestamp) {
            return $query->where('updated_at', '>=', $timestamp);
        }
        return $query;
    }

    /**
     * Get rates for a specific collection.
     */
    public function scopeForCollection($query, $collectionId)
    {
        return $query->where('collection_id', $collectionId);
    }

    /**
     * Get the current rate (highest version).
     */
    public function scopeCurrentVersion($query, $name)
    {
        return $query->where('name', $name)
                     ->orderBy('version', 'desc')
                     ->first();
    }
}
