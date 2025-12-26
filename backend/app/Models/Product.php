<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'code',
        'description',
        'unit',
        'category',
        'is_active',
        'created_by',
        'updated_by',
        'version',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'version' => 'integer',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });

        static::updating(function ($model) {
            $model->version++;
        });
    }

    // Relationships
    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class, 'rates')
            ->withPivot(['rate', 'effective_from', 'effective_to', 'is_active'])
            ->withTimestamps();
    }

    public function rates()
    {
        return $this->hasMany(Rate::class);
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Helpers
    public function getCurrentRate($supplierId, $date = null)
    {
        $date = $date ?? now()->toDateString();
        
        return $this->rates()
            ->where('supplier_id', $supplierId)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                      ->orWhere('effective_to', '>=', $date);
            })
            ->where('is_active', true)
            ->orderBy('effective_from', 'desc')
            ->first();
    }
}
