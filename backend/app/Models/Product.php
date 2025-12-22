<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasUuids;
    use SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'unit_type',
        'is_active',
        'version',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'version' => 'integer',
        'deleted_at' => 'datetime',
    ];

    public function rates()
    {
        return $this->hasMany(Rate::class);
    }

    public function collectionEntries()
    {
        return $this->hasMany(CollectionEntry::class);
    }
}
