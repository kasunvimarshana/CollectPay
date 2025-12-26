<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'code',
        'unit',
        'description',
        'user_id',
        'version',
    ];

    protected $casts = [
        'version' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rateVersions()
    {
        return $this->hasMany(RateVersion::class);
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }
}
