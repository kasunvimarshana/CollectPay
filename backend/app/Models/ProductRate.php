<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductRate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'unit',
        'rate',
        'effective_from',
        'effective_to',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the product this rate belongs to
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who created this rate
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all collections using this rate
     */
    public function collections()
    {
        return $this->hasMany(Collection::class, 'rate_id');
    }

    /**
     * Check if this rate is valid for a given date
     */
    public function isValidForDate($date)
    {
        $date = is_string($date) ? $date : $date->toDateString();
        
        $fromValid = $this->effective_from <= $date;
        $toValid = is_null($this->effective_to) || $this->effective_to >= $date;
        
        return $fromValid && $toValid && $this->is_active;
    }
}
