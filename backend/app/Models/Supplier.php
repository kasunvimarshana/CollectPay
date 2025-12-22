<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Supplier extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'name','phone','lat','lng','active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'lat' => 'float',
        'lng' => 'float',
    ];

    public function rates() { return $this->hasMany(Rate::class); }
    public function collections() { return $this->hasMany(Collection::class); }
    public function payments() { return $this->hasMany(Payment::class); }
}
