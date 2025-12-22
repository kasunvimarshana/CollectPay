<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'phone',
        'address',
        'area',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get collections for this supplier
     */
    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Get payments for this supplier
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get rates for this supplier
     */
    public function rates()
    {
        return $this->hasMany(Rate::class);
    }
}
