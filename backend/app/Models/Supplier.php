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
        'phone',
        'email',
        'address',
        'location',
        'is_active',
        'version'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'version' => 'integer'
    ];

    /**
     * Get collections for this supplier
     */
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Get payments for this supplier
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Calculate total amount owed to supplier
     */
    public function calculateTotalOwed(): float
    {
        $totalCollections = $this->collections()
            ->whereNull('deleted_at')
            ->sum('total_amount');
        
        $totalPayments = $this->payments()
            ->whereNull('deleted_at')
            ->sum('amount');
        
        return $totalCollections - $totalPayments;
    }
}
