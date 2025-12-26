<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SyncOperation extends Model
{
    protected $fillable = [
        'device_id',
        'user_id',
        'entity_type',
        'entity_id',
        'operation_type',
        'local_id',
        'payload',
        'status',
        'conflict_data',
        'error_message',
        'attempted_at',
        'completed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'conflict_data' => 'array',
        'attempted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark operation as successful
     */
    public function markAsSuccess(?int $entityId = null): void
    {
        $this->update([
            'status' => 'success',
            'entity_id' => $entityId ?? $this->entity_id,
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark operation as failed
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'attempted_at' => now(),
        ]);
    }

    /**
     * Mark operation as having conflict
     */
    public function markAsConflict(array $conflictData): void
    {
        $this->update([
            'status' => 'conflict',
            'conflict_data' => $conflictData,
            'attempted_at' => now(),
        ]);
    }
}
