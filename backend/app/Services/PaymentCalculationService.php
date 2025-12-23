<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

/**
 * Payment Calculation Service
 * 
 * Handles automated payment calculations based on collections and existing payments.
 * Implements transparent financial management with historical data tracking.
 */
class PaymentCalculationService
{
    /**
     * Calculate the balance for a supplier
     * 
     * @param int $supplierId
     * @param string|null $upToDate Calculate balance up to this date (ISO 8601)
     * @return array
     */
    public function calculateSupplierBalance(int $supplierId, ?string $upToDate = null): array
    {
        $query = Collection::where('supplier_id', $supplierId);
        
        if ($upToDate) {
            $query->where('collection_date', '<=', $upToDate);
        }
        
        // Calculate total value from collections
        $collections = $query->get();
        $totalCollectionValue = $collections->sum(function ($collection) {
            return $collection->quantity * $collection->rate;
        });
        
        // Calculate total payments made
        $paymentsQuery = Payment::where('supplier_id', $supplierId);
        
        if ($upToDate) {
            $paymentsQuery->where('payment_date', '<=', $upToDate);
        }
        
        $totalPayments = $paymentsQuery->sum('amount');
        
        // Calculate advance payments (made before any collection)
        $advancePayments = Payment::where('supplier_id', $supplierId)
            ->where('payment_type', 'advance')
            ->when($upToDate, fn($q) => $q->where('payment_date', '<=', $upToDate))
            ->sum('amount');
        
        $balance = $totalCollectionValue - $totalPayments + $advancePayments;
        
        return [
            'supplier_id' => $supplierId,
            'total_collection_value' => round($totalCollectionValue, 2),
            'total_payments' => round($totalPayments, 2),
            'advance_payments' => round($advancePayments, 2),
            'balance' => round($balance, 2),
            'status' => $balance > 0 ? 'owed_to_supplier' : ($balance < 0 ? 'owes_us' : 'settled'),
        ];
    }
    
    /**
     * Calculate payment details for a collection
     * 
     * @param int $collectionId
     * @return array
     */
    public function calculateCollectionPayment(int $collectionId): array
    {
        $collection = Collection::with(['supplier', 'product'])->findOrFail($collectionId);
        
        $totalValue = $collection->quantity * $collection->rate;
        
        return [
            'collection_id' => $collectionId,
            'quantity' => $collection->quantity,
            'unit' => $collection->unit,
            'rate' => $collection->rate,
            'total_value' => round($totalValue, 2),
            'product' => $collection->product->name,
            'supplier' => $collection->supplier->name,
        ];
    }
    
    /**
     * Get payment summary for all suppliers
     * 
     * @return array
     */
    public function getPaymentSummary(): array
    {
        $suppliers = Supplier::all();
        $summary = [];
        
        foreach ($suppliers as $supplier) {
            $balance = $this->calculateSupplierBalance($supplier->id);
            $summary[] = [
                'supplier_id' => $supplier->id,
                'supplier_name' => $supplier->name,
                'balance' => $balance['balance'],
                'status' => $balance['status'],
            ];
        }
        
        return $summary;
    }
    
    /**
     * Validate payment against supplier balance
     * 
     * @param int $supplierId
     * @param float $amount
     * @param string $paymentType
     * @return array
     */
    public function validatePayment(int $supplierId, float $amount, string $paymentType): array
    {
        $balance = $this->calculateSupplierBalance($supplierId);
        
        $errors = [];
        $warnings = [];
        
        // For advance payments, no balance check needed
        if ($paymentType === 'advance') {
            return [
                'valid' => true,
                'errors' => [],
                'warnings' => ['This is an advance payment. It will be applied to future collections.'],
            ];
        }
        
        // For regular or partial payments
        if ($paymentType === 'full' && $amount > $balance['balance']) {
            $errors[] = "Payment amount ({$amount}) exceeds the balance owed ({$balance['balance']})";
        }
        
        if ($amount <= 0) {
            $errors[] = "Payment amount must be greater than zero";
        }
        
        if ($balance['balance'] <= 0 && $paymentType !== 'advance') {
            $warnings[] = "Supplier has no outstanding balance";
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
            'current_balance' => $balance['balance'],
            'new_balance' => $balance['balance'] - $amount,
        ];
    }
    
    /**
     * Get detailed payment history for a supplier
     * 
     * @param int $supplierId
     * @return array
     */
    public function getSupplierPaymentHistory(int $supplierId): array
    {
        $collections = Collection::where('supplier_id', $supplierId)
            ->orderBy('collection_date', 'asc')
            ->get();
            
        $payments = Payment::where('supplier_id', $supplierId)
            ->orderBy('payment_date', 'asc')
            ->get();
            
        $history = [];
        $runningBalance = 0;
        
        // Combine collections and payments in chronological order
        foreach ($collections as $collection) {
            $value = $collection->quantity * $collection->rate;
            $runningBalance += $value;
            
            $history[] = [
                'date' => $collection->collection_date,
                'type' => 'collection',
                'description' => "{$collection->quantity} {$collection->unit} collected",
                'amount' => $value,
                'balance' => $runningBalance,
            ];
        }
        
        foreach ($payments as $payment) {
            $runningBalance -= $payment->amount;
            
            $history[] = [
                'date' => $payment->payment_date,
                'type' => 'payment',
                'description' => "{$payment->payment_type} payment via {$payment->payment_method}",
                'amount' => -$payment->amount,
                'balance' => $runningBalance,
            ];
        }
        
        // Sort by date
        usort($history, fn($a, $b) => strtotime($a['date']) - strtotime($b['date']));
        
        return [
            'supplier_id' => $supplierId,
            'history' => $history,
            'final_balance' => round($runningBalance, 2),
        ];
    }
}
