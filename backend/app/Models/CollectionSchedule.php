<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CollectionSchedule extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'supplier_id','product_id','type','custom_cron','start_date','end_date'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function supplier() { return $this->belongsTo(Supplier::class); }
    public function product() { return $this->belongsTo(Product::class); }
}
