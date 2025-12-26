<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Rate;
use App\Models\Supplier;
use Carbon\Carbon;

class PaymentCalculationService
{
    public function calculateTransactionAmount(
        int $productId,
        int $supplierId,
        float $quantity,
        string $unit,
        ?Carbon $date = null
    ): array {
        $date = $date ?? now();
        $product = Product::findOrFail($productId);

        // Convert quantity to base unit
        $baseQuantity = $product->convertToBaseUnit($quantity, $unit);

        // Find applicable rate
        $rate = $this->findApplicableRate($productId, $supplierId, $unit, $date);

        if (! $rate) {
            throw new \Exception('No applicable rate found for the given date and parameters');
        }

        // Calculate amount
        $amount = $baseQuantity * $rate->rate;

        return [
            'quantity' => $quantity,
            'unit' => $unit,
            'base_quantity' => $baseQuantity,
            'base_unit' => $product->base_unit,
            'rate' => $rate->rate,
            'rate_unit' => $rate->unit,
            'amount' => round($amount, 2),
        ];
    }

    public function getSupplierBalance(int $supplierId, ?Carbon $asOf = null): array
    {
        $supplier = Supplier::findOrFail($supplierId);
        $asOf = $asOf ?? now();

        $transactions = $supplier->transactions()
            ->where('transaction_date', '<=', $asOf)
            ->get();

        $payments = $supplier->payments()
            ->where('payment_date', '<=', $asOf)
            ->get();

        $totalDebit = $transactions->sum('amount');
        $totalCredit = $payments->sum('amount');
        $balance = $totalDebit - $totalCredit;

        return [
            'supplier_id' => $supplierId,
            'supplier_name' => $supplier->name,
            'total_debit' => round($totalDebit, 2),
            'total_credit' => round($totalCredit, 2),
            'balance' => round($balance, 2),
            'as_of' => $asOf->toDateTimeString(),
        ];
    }

    private function findApplicableRate(
        int $productId,
        int $supplierId,
        string $unit,
        Carbon $date
    ): ?Rate {
        // First try to find supplier-specific rate
        $rate = Rate::where('product_id', $productId)
            ->where('supplier_id', $supplierId)
            ->where('unit', $unit)
            ->where('valid_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('valid_to')
                    ->orWhere('valid_to', '>=', $date);
            })
            ->orderBy('valid_from', 'desc')
            ->first();

        // If not found, try default rate for product
        if (! $rate) {
            $rate = Rate::where('product_id', $productId)
                ->whereNull('supplier_id')
                ->where('unit', $unit)
                ->where('is_default', true)
                ->where('valid_from', '<=', $date)
                ->where(function ($query) use ($date) {
                    $query->whereNull('valid_to')
                        ->orWhere('valid_to', '>=', $date);
                })
                ->orderBy('valid_from', 'desc')
                ->first();
        }

        return $rate;
    }
}
