<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'phone',
        'email',
        'address',
        'region',
        'metadata',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who created this supplier
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this supplier
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all collections for this supplier
     */
    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Get all payments for this supplier
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Calculate total collections amount for this supplier
     */
    public function totalCollections($startDate = null, $endDate = null)
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
     * Calculate total payments made to this supplier
     */
    public function totalPayments($startDate = null, $endDate = null)
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
     * Calculate outstanding balance for this supplier
     */
    public function outstandingBalance($startDate = null, $endDate = null)
    {
        return $this->totalCollections($startDate, $endDate) - $this->totalPayments($startDate, $endDate);
    }
}
