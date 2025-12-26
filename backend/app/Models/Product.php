<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'code',
        'description',
        'default_unit',
        'available_units',
        'category',
        'is_active',
        'metadata',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'available_units' => 'array',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($product) {
            if (empty($product->uuid)) {
                $product->uuid = (string) Str::uuid();
            }
        });

        static::saving(function ($product) {
            $product->version++;
        });
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

    public function rates()
    {
        return $this->hasMany(Rate::class);
    }

    public function getCurrentRate($supplierId = null, $date = null)
    {
        $date = $date ?? now();
        
        return $this->rates()
            ->where('is_active', true)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                      ->orWhere('effective_to', '>=', $date);
            })
            ->where(function ($query) use ($supplierId) {
                if ($supplierId) {
                    $query->where('supplier_id', $supplierId);
                } else {
                    $query->whereNull('supplier_id');
                }
            })
            ->orderBy('effective_from', 'desc')
            ->first();
    }
}
