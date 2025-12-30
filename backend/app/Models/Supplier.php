<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'contact_person',
        'phone',
        'email',
        'address',
        'region',
        'is_active',
        'version',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'version' => 'integer',
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
     * Calculate total collected amount for a period
     */
    public function totalCollected($startDate = null, $endDate = null)
    {
        $query = $this->collections();
        
        if ($startDate) {
            $query->where('collection_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('collection_date', '<=', $endDate);
        }
        
        return $query->sum('total_amount');
    }

    /**
     * Calculate total payments made for a period
     */
    public function totalPaid($startDate = null, $endDate = null)
    {
        $query = $this->payments();
        
        if ($startDate) {
            $query->where('payment_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('payment_date', '<=', $endDate);
        }
        
        return $query->sum('amount');
    }

    /**
     * Calculate balance (collected - paid)
     */
    public function balance($startDate = null, $endDate = null)
    {
        return $this->totalCollected($startDate, $endDate) - $this->totalPaid($startDate, $endDate);
    }
}
