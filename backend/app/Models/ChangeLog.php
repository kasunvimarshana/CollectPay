<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChangeLog extends Model
{
    protected $fillable = [
        'model',
        'model_id',
        'operation',
        'version',
        'payload',
        'user_id',
        'device_id',
        'changed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'version' => 'integer',
        'changed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
