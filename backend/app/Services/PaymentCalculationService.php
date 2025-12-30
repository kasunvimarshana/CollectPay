<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class PaymentCalculationService
{
    protected RateManagementService $rateService;

    public function __construct(RateManagementService $rateService)
    {
        $this->rateService = $rateService;
    }
    /**
     * Calculate total amount owed to a supplier.
     * 
     * @param int $supplierId
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public function calculateSupplierBalance(int $supplierId, ?string $startDate = null, ?string $endDate = null): array
    {
        $supplier = Supplier::findOrFail($supplierId);

        // Get total collections
        $collectionsQuery = Collection::where('supplier_id', $supplierId);
        
        if ($startDate) {
            $collectionsQuery->where('collected_at', '>=', $startDate);
        }
        if ($endDate) {
            $collectionsQuery->where('collected_at', '<=', $endDate);
        }

        $totalCollectionAmount = $collectionsQuery->sum('total_amount');

        // Get total payments
        $paymentsQuery = Payment::where('supplier_id', $supplierId);
        
        if ($startDate) {
            $paymentsQuery->where('payment_date', '>=', $startDate);
        }
        if ($endDate) {
            $paymentsQuery->where('payment_date', '<=', $endDate);
        }

        $totalPayments = $paymentsQuery->sum('amount');

        // Calculate balance (what we owe the supplier)
        $balance = $totalCollectionAmount - $totalPayments;

        return [
            'supplier_id' => $supplierId,
            'supplier_name' => $supplier->name,
            'total_collection_amount' => (float) $totalCollectionAmount,
            'total_payments' => (float) $totalPayments,
            'balance' => (float) $balance,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ];
    }

    /**
     * Calculate payment for a new collection based on rate and quantity.
     * 
     * @param int $productId
     * @param float $quantity
     * @param string $unit
     * @param string|null $collectionDate
     * @return array
     */
    public function calculateCollectionAmount(int $productId, float $quantity, string $unit, ?string $collectionDate = null): array
    {
        $date = $collectionDate ?? now()->toDateString();

        // Use rate service to get the applicable rate
        $rate = $this->rateService->getCurrentRate($productId, $unit, $date);

        if (!$rate) {
            throw new \InvalidArgumentException("No valid rate found for product ID {$productId}, unit {$unit}, and date {$date}");
        }

        $totalAmount = $quantity * $rate->rate_per_unit;

        return [
            'rate_id' => $rate->id,
            'rate_per_unit' => (float) $rate->rate_per_unit,
            'quantity' => (float) $quantity,
            'unit' => $unit,
            'total_amount' => (float) $totalAmount,
        ];
    }

    /**
     * Process a full settlement payment for a supplier.
     * 
     * @param int $supplierId
     * @param array $paymentData
     * @return Payment
     */
    public function processFullSettlement(int $supplierId, array $paymentData): Payment
    {
        return DB::transaction(function () use ($supplierId, $paymentData) {
            $balance = $this->calculateSupplierBalance($supplierId);

            if ($balance['balance'] <= 0) {
                throw new \InvalidArgumentException("No outstanding balance for supplier ID {$supplierId}");
            }

            return Payment::create(array_merge($paymentData, [
                'supplier_id' => $supplierId,
                'amount' => $balance['balance'],
                'payment_type' => 'full',
            ]));
        });
    }

    /**
     * Validate if a payment amount is valid for the supplier's current balance.
     * 
     * @param int $supplierId
     * @param float $amount
     * @param string $paymentType
     * @return bool
     */
    public function validatePaymentAmount(int $supplierId, float $amount, string $paymentType): bool
    {
        if ($paymentType === 'advance') {
            // Advance payments can be any positive amount
            return $amount > 0;
        }

        $balance = $this->calculateSupplierBalance($supplierId);

        if ($paymentType === 'full') {
            // Full payment should match the balance
            return abs($amount - $balance['balance']) < 0.01; // Allow small floating point differences
        }

        if ($paymentType === 'partial') {
            // Partial payment should not exceed balance
            return $amount > 0 && $amount <= $balance['balance'];
        }

        // For adjustments, any amount is valid
        return true;
    }
}
