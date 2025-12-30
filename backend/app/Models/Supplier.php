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
        'code',
        'contact_person',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'status',
        'metadata',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    /**
     * Get the collections for this supplier.
     */
    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Get the payments for this supplier.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Calculate total collections for this supplier.
     */
    public function totalCollections()
    {
        return $this->collections()->sum('total_amount');
    }

    /**
     * Calculate total payments for this supplier.
     */
    public function totalPayments()
    {
        return $this->payments()->sum('amount');
    }

    /**
     * Calculate outstanding balance for this supplier.
     */
    public function outstandingBalance()
    {
        return $this->totalCollections() - $this->totalPayments();
    }

    /**
     * Calculate balance with optional date range.
     */
    public function calculateBalance($fromDate = null, $toDate = null)
    {
        $collectionsQuery = $this->collections();
        $paymentsQuery = $this->payments();

        if ($fromDate) {
            $collectionsQuery->where('collection_date', '>=', $fromDate);
            $paymentsQuery->where('payment_date', '>=', $fromDate);
        }

        if ($toDate) {
            $collectionsQuery->where('collection_date', '<=', $toDate);
            $paymentsQuery->where('payment_date', '<=', $toDate);
        }

        $totalCollections = $collectionsQuery->sum('total_amount');
        $totalPayments = $paymentsQuery->sum('amount');

        return [
            'total_collections' => $totalCollections,
            'total_payments' => $totalPayments,
            'outstanding_balance' => $totalCollections - $totalPayments,
        ];
    }
}
