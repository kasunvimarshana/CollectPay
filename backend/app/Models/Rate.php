<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Rate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'product_id',
        'supplier_id',
        'rate_value',
        'unit',
        'effective_from',
        'effective_to',
        'is_active',
        'metadata',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'rate_value' => 'decimal:4',
        'is_active' => 'boolean',
        'effective_from' => 'datetime',
        'effective_to' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($rate) {
            if (empty($rate->uuid)) {
                $rate->uuid = (string) Str::uuid();
            }
        });

        static::saving(function ($rate) {
            $rate->version++;
        });
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function isEffectiveOn($date)
    {
        $date = $date ?? now();
        
        return $this->effective_from <= $date && 
               ($this->effective_to === null || $this->effective_to >= $date);
    }
}
