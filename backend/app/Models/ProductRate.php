<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductRate extends Model
{
    use SoftDeletes;

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

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function isEffectiveOn($date)
    {
        $checkDate = $date instanceof \DateTime ? $date : \Carbon\Carbon::parse($date);
        $from = $this->effective_from;
        $to = $this->effective_to;

        return $checkDate->greaterThanOrEqualTo($from) &&
            ($to === null || $checkDate->lessThanOrEqualTo($to));
    }
}
