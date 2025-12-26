<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyncLog extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'device_id',
        'entity_type',
        'operation',
        'entity_id',
        'client_timestamp',
        'payload',
        'status',
        'error_message',
    ];

    protected $casts = [
        'client_timestamp' => 'datetime',
        'payload' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
