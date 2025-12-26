<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'category',
        'base_unit',
        'alternate_units',
        'status',
        'metadata',
    ];

    protected $casts = [
        'alternate_units' => 'array',
        'metadata' => 'array',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function rates(): HasMany
    {
        return $this->hasMany(Rate::class);
    }

    public function convertToBaseUnit(float $quantity, string $unit): float
    {
        if ($unit === $this->base_unit) {
            return $quantity;
        }

        $alternateUnits = $this->alternate_units ?? [];
        foreach ($alternateUnits as $altUnit) {
            if ($altUnit['unit'] === $unit) {
                return $quantity * ($altUnit['factor'] ?? 1);
            }
        }

        return $quantity;
    }
}
