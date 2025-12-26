<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class PaymentCalculationService
{
    /**
     * Calculate outstanding balance for a supplier
     */
    public function calculateOutstanding(int $supplierId, ?string $upToDate = null): array
    {
        $supplier = Supplier::findOrFail($supplierId);
        $upToDate = $upToDate ?? now()->toDateString();

        // Calculate total collections
        $totalCollections = Collection::where('supplier_id', $supplierId)
            ->where('collection_date', '<=', $upToDate)
            ->whereNull('deleted_at')
            ->sum('total_amount');

        // Calculate total payments
        $totalPayments = Payment::where('supplier_id', $supplierId)
            ->where('payment_date', '<=', $upToDate)
            ->whereNull('deleted_at')
            ->sum('amount');

        $outstanding = $totalCollections - $totalPayments;

        return [
            'supplier_id' => $supplierId,
            'supplier_name' => $supplier->name,
            'total_collections' => (float) $totalCollections,
            'total_payments' => (float) $totalPayments,
            'outstanding_balance' => (float) $outstanding,
            'calculated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Get detailed payment calculation breakdown
     */
    public function getCalculationDetails(int $supplierId, ?string $fromDate = null, ?string $toDate = null): array
    {
        $toDate = $toDate ?? now()->toDateString();
        $fromDate = $fromDate ?? null;

        $query = Collection::where('supplier_id', $supplierId)
            ->with(['product', 'rate'])
            ->where('collection_date', '<=', $toDate);

        if ($fromDate) {
            $query->where('collection_date', '>=', $fromDate);
        }

        $collections = $query->orderBy('collection_date', 'asc')->get();

        $details = $collections->map(function ($collection) {
            return [
                'id' => $collection->id,
                'date' => $collection->collection_date->toDateString(),
                'product' => $collection->product->name,
                'quantity' => (float) $collection->quantity,
                'rate' => (float) $collection->rate_applied,
                'amount' => (float) $collection->total_amount,
            ];
        });

        $payments = Payment::where('supplier_id', $supplierId)
            ->where('payment_date', '<=', $toDate)
            ->when($fromDate, function ($q) use ($fromDate) {
                $q->where('payment_date', '>=', $fromDate);
            })
            ->orderBy('payment_date', 'asc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'date' => $payment->payment_date->toDateString(),
                    'type' => $payment->payment_type,
                    'amount' => (float) $payment->amount,
                    'method' => $payment->payment_method,
                ];
            });

        return [
            'collections' => $details,
            'payments' => $payments,
            'summary' => $this->calculateOutstanding($supplierId, $toDate),
        ];
    }

    /**
     * Process a payment and update outstanding balances
     */
    public function processPayment(array $paymentData): Payment
    {
        return DB::transaction(function () use ($paymentData) {
            // Calculate current outstanding
            $outstanding = $this->calculateOutstanding($paymentData['supplier_id']);

            // Create payment record
            $payment = Payment::create([
                'uuid' => $paymentData['uuid'] ?? \Illuminate\Support\Str::uuid()->toString(),
                'supplier_id' => $paymentData['supplier_id'],
                'payment_type' => $paymentData['payment_type'] ?? 'full',
                'amount' => $paymentData['amount'],
                'payment_date' => $paymentData['payment_date'],
                'payment_time' => $paymentData['payment_time'] ?? now(),
                'payment_method' => $paymentData['payment_method'] ?? 'cash',
                'reference_number' => $paymentData['reference_number'] ?? null,
                'outstanding_before' => $outstanding['outstanding_balance'],
                'outstanding_after' => $outstanding['outstanding_balance'] - $paymentData['amount'],
                'notes' => $paymentData['notes'] ?? null,
                'calculation_details' => [
                    'total_collections' => $outstanding['total_collections'],
                    'total_payments_before' => $outstanding['total_payments'],
                    'calculated_at' => $outstanding['calculated_at'],
                ],
                'processed_by' => $paymentData['processed_by'] ?? auth()->id(),
            ]);

            return $payment;
        });
    }

    /**
     * Validate payment amount against outstanding
     */
    public function validatePaymentAmount(int $supplierId, float $amount): array
    {
        $outstanding = $this->calculateOutstanding($supplierId);
        
        $isValid = $amount <= $outstanding['outstanding_balance'];
        
        return [
            'is_valid' => $isValid,
            'amount' => $amount,
            'outstanding' => $outstanding['outstanding_balance'],
            'message' => $isValid 
                ? 'Payment amount is valid' 
                : 'Payment amount exceeds outstanding balance',
        ];
    }
}
