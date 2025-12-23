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
        'description',
        'unit_type',
        'base_rate',
        'metadata',
        'status',
    ];

    protected $casts = [
        'metadata' => 'array',
        'base_rate' => 'decimal:2',
    ];

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function rates()
    {
        return $this->hasMany(ProductRate::class);
    }

    public function getCurrentRate()
    {
        return $this->rates()
            ->where('effective_from', '<=', now())
            ->orderBy('effective_from', 'desc')
            ->first()?->rate ?? $this->base_rate;
    }
}
