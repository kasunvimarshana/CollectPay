<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasUuids;
    use SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'phone',
        'address',
        'external_code',
        'is_active',
        'created_by_user_id',
        'version',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'version' => 'integer',
        'deleted_at' => 'datetime',
    ];

    public function collectionEntries()
    {
        return $this->hasMany(CollectionEntry::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
