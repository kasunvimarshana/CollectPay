<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class SyncQueue extends Model
{
    use HasFactory;

    protected $table = 'sync_queue';

    protected $fillable = [
        'uuid',
        'user_id',
        'entity_type',
        'entity_uuid',
        'operation',
        'payload',
        'payload_signature',
        'status',
        'retry_count',
        'last_retry_at',
        'error_message',
        'client_version',
        'server_version',
        'device_id',
    ];

    protected $casts = [
        'payload' => 'array',
        'last_retry_at' => 'datetime',
        'client_version' => 'integer',
        'server_version' => 'integer',
        'retry_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($syncQueue) {
            if (empty($syncQueue->uuid)) {
                $syncQueue->uuid = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function markAsProcessing()
    {
        $this->update(['status' => 'processing']);
    }

    public function markAsCompleted($serverVersion)
    {
        $this->update([
            'status' => 'completed',
            'server_version' => $serverVersion,
        ]);
    }

    public function markAsFailed($errorMessage)
    {
        $this->update([
            'status' => 'failed',
            'retry_count' => $this->retry_count + 1,
            'last_retry_at' => now(),
            'error_message' => $errorMessage,
        ]);
    }

    public function canRetry($maxRetries = 3)
    {
        return $this->retry_count < $maxRetries;
    }
}
