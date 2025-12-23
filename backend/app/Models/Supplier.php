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
        'email',
        'phone',
        'location',
        'latitude',
        'longitude',
        'metadata',
        'status',
        'created_by',
    ];

    protected $casts = [
        'metadata' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getBalanceAttribute()
    {
        $totalPayments = $this->payments()->sum('amount');
        $totalDue = $this->collections()->sum('total_amount');
        return $totalDue - $totalPayments;
    }
}
