<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'registration_number',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getTotalCollectionsAmount()
    {
        return $this->collections()->sum('total_amount');
    }

    public function getTotalPaymentsAmount()
    {
        return $this->payments()->sum('amount');
    }

    public function getBalanceAmount()
    {
        return $this->getTotalCollectionsAmount() - $this->getTotalPaymentsAmount();
    }
}
