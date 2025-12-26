<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'code',
        'default_unit',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function rates()
    {
        return $this->hasMany(ProductRate::class);
    }

    public function activeRates()
    {
        return $this->rates()->where('is_active', true);
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function getCurrentRate($unit = null, $date = null)
    {
        $query = $this->rates()
            ->where('is_active', true)
            ->where('effective_from', '<=', $date ?? now());

        if ($unit) {
            $query->where('unit', $unit);
        }

        return $query->where(function ($q) use ($date) {
            $q->whereNull('effective_to')
                ->orWhere('effective_to', '>=', $date ?? now());
        })->orderBy('effective_from', 'desc')->first();
    }
}
