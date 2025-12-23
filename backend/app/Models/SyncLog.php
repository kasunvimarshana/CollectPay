<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SyncLog extends Model
{
    protected $fillable = [
        'uuid',
        'device_id',
        'user_id',
        'entity_type',
        'entity_id',
        'entity_uuid',
        'action',
        'status',
        'data',
        'conflict_data',
        'error_message',
        'synced_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'conflict_data' => 'array',
            'synced_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the user for this sync log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark sync as successful
     */
    public function markAsSuccessful($entityId = null): void
    {
        $this->update([
            'status' => 'success',
            'entity_id' => $entityId ?? $this->entity_id,
            'synced_at' => now(),
            'error_message' => null,
        ]);
    }

    /**
     * Mark sync as failed
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Mark sync as conflict
     */
    public function markAsConflict(array $conflictData): void
    {
        $this->update([
            'status' => 'conflict',
            'conflict_data' => $conflictData,
        ]);
    }
}
