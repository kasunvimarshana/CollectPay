<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SyncLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'device_id',
        'entity_type',
        'entity_uuid',
        'operation',
        'payload',
        'conflicts',
        'resolution',
        'status',
        'error_message',
        'retry_count',
        'synced_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'conflicts' => 'array',
        'retry_count' => 'integer',
        'synced_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeConflicted($query)
    {
        return $query->where('status', 'conflict');
    }

    // Helpers
    public function markAsSuccess()
    {
        $this->update([
            'status' => 'success',
            'synced_at' => now(),
        ]);
    }

    public function markAsFailed($errorMessage)
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'retry_count' => $this->retry_count + 1,
        ]);
    }

    public function markAsConflict($conflicts, $resolution = null)
    {
        $this->update([
            'status' => 'conflict',
            'conflicts' => $conflicts,
            'resolution' => $resolution,
        ]);
    }
}
