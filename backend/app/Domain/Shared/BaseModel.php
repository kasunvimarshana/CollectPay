<?php

namespace App\Domain\Shared;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Domain\Shared\Traits\HasUuid;
use App\Domain\Shared\Traits\Syncable;

abstract class BaseModel extends Model
{
    use HasUuid, SoftDeletes, Syncable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'synced_at' => 'datetime',
        'is_dirty' => 'boolean',
        'version' => 'integer',
    ];

    /**
     * Get attributes that should be encrypted at rest
     */
    public function getEncryptedAttributes(): array
    {
        return [];
    }

    /**
     * Generate a unique reference number
     */
    protected static function generateReferenceNumber(string $prefix): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(substr(md5(uniqid()), 0, 6));
        return "{$prefix}-{$date}-{$random}";
    }
}
