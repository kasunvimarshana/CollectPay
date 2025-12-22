<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'unit',
        'description',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get collections for this product
     */
    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Get rates for this product
     */
    public function rates()
    {
        return $this->hasMany(Rate::class);
    }
}
