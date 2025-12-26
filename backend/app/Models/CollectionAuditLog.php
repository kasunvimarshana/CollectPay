<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollectionAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'collection_id',
        'action',
        'old_data',
        'new_data',
        'user_id',
        'ip_address',
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
    ];

    /**
     * Get the collection this log belongs to
     */
    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    /**
     * Get the user who performed the action
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
