<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SyncQueue extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'sync_queue';

    protected $fillable = [
        'device_id',
        'user_id',
        'operation',
        'entity_type',
        'entity_id',
        'entity_uuid',
        'payload',
        'idempotency_key',
        'status',
        'attempts',
        'last_error',
        'processed_at',
        'synced_at',
    ];

    protected $casts = [
        'payload' => 'json',
        'processed_at' => 'datetime',
        'synced_at' => 'datetime',
    ];

    /**
     * Get the user who initiated this sync operation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get pending sync items.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Get failed sync items.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Get synced items.
     */
    public function scopeSynced($query)
    {
        return $query->where('status', 'synced');
    }

    /**
     * Get items for a specific device.
     */
    public function scopeForDevice($query, string $deviceId)
    {
        return $query->where('device_id', $deviceId);
    }

    /**
     * Get items for a specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Increment attempt count.
     */
    public function incrementAttempt(): void
    {
        $this->attempts++;
        $this->save();
    }
}
