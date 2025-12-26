<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'entity_uuid',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'device_id',
        'metadata',
    ];

    protected $casts = [
        'old_values' => 'json',
        'new_values' => 'json',
        'metadata' => 'json',
    ];

    public $timestamps = true;
    const UPDATED_AT = null;

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get audit logs for a specific entity.
     */
    public function scopeForEntity($query, string $type, $entityId)
    {
        return $query->where('entity_type', $type)
                     ->where('entity_id', $entityId)
                     ->orderBy('created_at', 'desc');
    }

    /**
     * Get audit logs for a specific action.
     */
    public function scopeForAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Get audit logs since a given timestamp.
     */
    public function scopeSince($query, ?\DateTime $timestamp)
    {
        if ($timestamp) {
            return $query->where('created_at', '>=', $timestamp);
        }
        return $query;
    }
}
