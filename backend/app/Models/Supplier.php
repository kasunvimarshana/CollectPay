<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'address',
        'phone',
        'email',
        'metadata',
        'is_active',
        'version',
        'device_id',
        'sync_metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'sync_metadata' => 'array',
        'is_active' => 'boolean',
    ];

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getTotalCollectionsAmount(): float
    {
        return $this->collections()->sum('total_amount');
    }

    public function getTotalPaymentsAmount(): float
    {
        return $this->payments()->sum('amount');
    }

    public function getBalanceAmount(): float
    {
        return $this->getTotalCollectionsAmount() - $this->getTotalPaymentsAmount();
    }
}
