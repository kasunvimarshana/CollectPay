<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SyncQueue extends Model
{
    protected $table = 'sync_queue';

    protected $fillable = [
        'entity_type',
        'entity_id',
        'client_uuid',
        'device_id',
        'user_id',
        'data',
        'operation',
        'status',
        'retry_count',
        'error_message',
        'conflict_data',
        'processed_at',
    ];

    protected $casts = [
        'data' => 'array',
        'conflict_data' => 'array',
        'processed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markAsProcessed(int $entityId = null): void
    {
        $this->update([
            'status' => 'completed',
            'entity_id' => $entityId,
            'processed_at' => now(),
        ]);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
            'retry_count' => $this->retry_count + 1,
        ]);
    }

    public function markAsConflict(array $conflictData): void
    {
        $this->update([
            'status' => 'conflict',
            'conflict_data' => $conflictData,
        ]);
    }
}
