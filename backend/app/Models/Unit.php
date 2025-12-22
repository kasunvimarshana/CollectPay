<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'code',
        'name',
        'unit_type',
        'to_base_multiplier',
        'version',
    ];

    protected $casts = [
        'to_base_multiplier' => 'decimal:6',
        'version' => 'integer',
    ];

    public function collectionEntries()
    {
        return $this->hasMany(CollectionEntry::class);
    }
}
