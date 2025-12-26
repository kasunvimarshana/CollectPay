<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Collection extends Model
{
    use HasFactory, SoftDeletes;

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
        'metadata' => 'json',
        'synced_at' => 'datetime',
    ];

    protected $hidden = [];

    /**
     * Get the user who created this collection.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this collection.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all payments associated with this collection.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get all rates associated with this collection.
     */
    public function rates(): HasMany
    {
        return $this->hasMany(Rate::class);
    }

    /**
     * Get modified collections since a given timestamp.
     */
    public function scopeModifiedSince($query, ?\DateTime $timestamp)
    {
        if ($timestamp) {
            return $query->where('updated_at', '>=', $timestamp);
        }
        return $query;
    }
}
