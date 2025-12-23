<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'rate',
        'unit',
        'effective_from',
        'effective_to',
        'is_current',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_current' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($rate) {
            // Mark previous rates as non-current
            if ($rate->is_current) {
                ProductRate::where('product_id', $rate->product_id)
                    ->where('unit', $rate->unit)
                    ->where('is_current', true)
                    ->update([
                        'is_current' => false,
                        'effective_to' => $rate->effective_from->subDay(),
                    ]);
            }
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isActive($date = null): bool
    {
        $date = $date ?? now();
        
        return $this->effective_from <= $date 
            && (is_null($this->effective_to) || $this->effective_to >= $date);
    }
}
