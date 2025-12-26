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

    /**
     * Get total collections amount
     * 
     * NOTE: This method is kept for backward compatibility.
     * For new code, use SupplierBalanceService in the domain layer.
     * 
     * @return float
     */
    public function getTotalCollectionsAmount(): float
    {
        return $this->collections()->sum('total_amount');
    }

    /**
     * Get total payments amount
     * 
     * NOTE: This method is kept for backward compatibility.
     * For new code, use SupplierBalanceService in the domain layer.
     * 
     * @return float
     */
    public function getTotalPaymentsAmount(): float
    {
        return $this->payments()->sum('amount');
    }

    /**
     * Get balance amount (collections - payments)
     * 
     * NOTE: This method is kept for backward compatibility.
     * For new code, use SupplierBalanceService in the domain layer.
     * 
     * @return float
     */
    public function getBalanceAmount(): float
    {
        return $this->getTotalCollectionsAmount() - $this->getTotalPaymentsAmount();
    }
}
