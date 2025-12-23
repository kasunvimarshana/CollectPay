<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyncConflict extends Model
{
    use HasFactory;

    protected $fillable = [
        'entity_type',
        'entity_id',
        'device_id',
        'local_data',
        'server_data',
        'conflict_type',
        'resolution_status',
        'resolved_data',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'local_data' => 'array',
        'server_data' => 'array',
        'resolved_data' => 'array',
        'resolved_at' => 'datetime',
    ];

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
