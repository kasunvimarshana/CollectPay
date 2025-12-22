<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Collection extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'supplier_id','product_id','quantity','unit','collected_at','notes'
    ];

    protected $casts = [
        'collected_at' => 'datetime',
        'quantity' => 'decimal:4',
    ];

    public function supplier() { return $this->belongsTo(Supplier::class); }
    public function product() { return $this->belongsTo(Product::class); }
}
