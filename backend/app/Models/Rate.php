<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Rate extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'supplier_id','product_id','price_per_unit','currency','effective_from','effective_to'
    ];

    protected $casts = [
        'effective_from' => 'datetime',
        'effective_to' => 'datetime',
        'price_per_unit' => 'decimal:4',
    ];

    public function supplier() { return $this->belongsTo(Supplier::class); }
    public function product() { return $this->belongsTo(Product::class); }
}
