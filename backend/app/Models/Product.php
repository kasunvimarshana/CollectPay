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
        'unit_type',
        'primary_unit',
        'allowed_units',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'allowed_units' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($product) {
            if (empty($product->code)) {
                $product->code = 'PRD-' . strtoupper(uniqid());
            }
            
            // Set default allowed units based on unit type
            if (empty($product->allowed_units)) {
                $product->allowed_units = $product->unit_type === 'weight' 
                    ? ['gram', 'kilogram']
                    : ['milliliter', 'liter'];
            }
        });
    }

    public function rates(): HasMany
    {
        return $this->hasMany(ProductRate::class);
    }

    public function currentRate()
    {
        return $this->hasOne(ProductRate::class)
            ->where('is_current', true)
            ->where('effective_from', '<=', now())
            ->where(function ($query) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', now());
            })
            ->latest('effective_from');
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    public function getRateForDate($date = null)
    {
        $date = $date ?? now();
        
        return $this->rates()
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            })
            ->latest('effective_from')
            ->first();
    }
}
