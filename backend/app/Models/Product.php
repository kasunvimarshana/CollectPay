<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'default_unit',
        'supported_units',
        'metadata',
        'is_active',
        'version',
    ];

    protected $casts = [
        'supported_units' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    public function rates(): HasMany
    {
        return $this->hasMany(ProductRate::class);
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    public function getCurrentRate(string $unit, string $date = null): ?ProductRate
    {
        $date = $date ?? now()->format('Y-m-d');
        
        return $this->rates()
            ->where('unit', $unit)
            ->where('effective_date', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', $date);
            })
            ->where('is_active', true)
            ->orderBy('effective_date', 'desc')
            ->first();
    }
}
