<?php

namespace App\Domain\Shared\Traits;

trait Syncable
{
    public static function bootSyncable(): void
    {
        static::creating(function ($model) {
            if (empty($model->version)) {
                $model->version = 1;
            }
            if (empty($model->sync_status)) {
                $model->sync_status = 'synced';
            }
        });

        static::updating(function ($model) {
            $model->version = $model->version + 1;
        });
    }

    public function markAsSynced(): void
    {
        $this->synced_at = now();
        $this->is_dirty = false;
        $this->sync_status = 'synced';
        $this->saveQuietly();
    }

    public function markAsDirty(): void
    {
        $this->is_dirty = true;
        $this->sync_status = 'pending';
        $this->saveQuietly();
    }

    public function markAsConflict(): void
    {
        $this->sync_status = 'conflict';
        $this->saveQuietly();
    }

    public function getSyncData(): array
    {
        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'version' => $this->version,
            'synced_at' => $this->synced_at?->toIso8601String(),
            'sync_status' => $this->sync_status,
            'data' => $this->toArray(),
        ];
    }

    public function scopePendingSync($query)
    {
        return $query->where('sync_status', 'pending')
            ->orWhere('is_dirty', true);
    }

    public function scopeSyncedAfter($query, $timestamp)
    {
        return $query->where('synced_at', '>', $timestamp);
    }

    public function scopeModifiedSince($query, $timestamp)
    {
        return $query->where('updated_at', '>', $timestamp);
    }
}
