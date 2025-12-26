<?php

namespace App\Application\Payment\Services;

use App\Domain\Payment\Models\Payment;
use App\Domain\Supplier\Models\Supplier;
use App\Domain\Collection\Models\Collection;
use Illuminate\Support\Facades\DB;

class PaymentCalculationService
{
    /**
     * Calculate settlement payment for a supplier
     */
    public function calculateSettlement(
        string $supplierId,
        string $periodStart,
        string $periodEnd,
        ?float $adjustments = null
    ): array {
        $supplier = Supplier::findOrFail($supplierId);

        // Get all confirmed collections in period
        $collections = Collection::forSupplier($supplierId)
            ->confirmed()
            ->betweenDates($periodStart, $periodEnd)
            ->get();

        // Calculate total collection amount
        $totalCollectionAmount = $collections->sum('net_amount');

        // Get previous advances in period
        $previousAdvances = Payment::forSupplier($supplierId)
            ->ofType('advance')
            ->approved()
            ->betweenDates($periodStart, $periodEnd)
            ->sum('amount');

        // Get previous partial payments in period
        $previousPartials = Payment::forSupplier($supplierId)
            ->ofType('partial')
            ->approved()
            ->betweenDates($periodStart, $periodEnd)
            ->sum('amount');

        // Calculate balance due
        $balanceDue = $totalCollectionAmount 
            - $previousAdvances 
            - $previousPartials 
            + ($adjustments ?? 0);

        return [
            'supplier_id' => $supplierId,
            'supplier_name' => $supplier->name,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'total_collections' => $collections->count(),
            'total_quantity' => $collections->sum('quantity_in_primary_unit'),
            'total_collection_amount' => round($totalCollectionAmount, 4),
            'previous_advances' => round($previousAdvances, 4),
            'previous_partials' => round($previousPartials, 4),
            'adjustments' => $adjustments ?? 0,
            'balance_due' => round($balanceDue, 4),
            'collections' => $collections->map(function ($c) {
                return [
                    'id' => $c->id,
                    'reference' => $c->reference_number,
                    'date' => $c->collection_date->toDateString(),
                    'product' => $c->product->name ?? 'Unknown',
                    'quantity' => $c->quantity_in_primary_unit,
                    'rate' => $c->rate_at_collection,
                    'net_amount' => $c->net_amount,
                ];
            })->toArray(),
        ];
    }

    /**
     * Get supplier account statement
     */
    public function getSupplierStatement(
        string $supplierId,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        $supplier = Supplier::findOrFail($supplierId);

        $startDate = $startDate ?? now()->startOfMonth()->toDateString();
        $endDate = $endDate ?? now()->endOfMonth()->toDateString();

        // Get all transactions
        $collections = Collection::forSupplier($supplierId)
            ->confirmed()
            ->betweenDates($startDate, $endDate)
            ->orderBy('collection_date')
            ->get();

        $payments = Payment::forSupplier($supplierId)
            ->approved()
            ->betweenDates($startDate, $endDate)
            ->orderBy('payment_date')
            ->get();

        // Build statement entries
        $entries = [];
        $runningBalance = 0;

        // Add collections as credits
        foreach ($collections as $collection) {
            $runningBalance += $collection->net_amount;
            $entries[] = [
                'date' => $collection->collection_date->toDateString(),
                'type' => 'collection',
                'reference' => $collection->reference_number,
                'description' => "Collection: {$collection->product->name} - {$collection->quantity_in_primary_unit} {$collection->product->primary_unit}",
                'credit' => $collection->net_amount,
                'debit' => 0,
                'balance' => $runningBalance,
            ];
        }

        // Add payments as debits
        foreach ($payments as $payment) {
            $runningBalance -= $payment->amount;
            $entries[] = [
                'date' => $payment->payment_date->toDateString(),
                'type' => 'payment',
                'reference' => $payment->reference_number,
                'description' => ucfirst($payment->payment_type) . " payment via {$payment->payment_method}",
                'credit' => 0,
                'debit' => $payment->amount,
                'balance' => $runningBalance,
            ];
        }

        // Sort by date
        usort($entries, fn($a, $b) => strcmp($a['date'], $b['date']));

        // Recalculate running balance in order
        $runningBalance = 0;
        foreach ($entries as &$entry) {
            $runningBalance += $entry['credit'] - $entry['debit'];
            $entry['balance'] = round($runningBalance, 4);
        }

        return [
            'supplier' => [
                'id' => $supplier->id,
                'code' => $supplier->code,
                'name' => $supplier->name,
            ],
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'summary' => [
                'total_credits' => round($collections->sum('net_amount'), 4),
                'total_debits' => round($payments->sum('amount'), 4),
                'closing_balance' => $runningBalance,
            ],
            'entries' => $entries,
        ];
    }

    /**
     * Create a settlement payment
     */
    public function createSettlementPayment(
        string $supplierId,
        string $periodStart,
        string $periodEnd,
        string $paidBy,
        string $paymentMethod = 'cash',
        ?float $adjustments = null,
        ?string $notes = null
    ): Payment {
        return DB::transaction(function () use (
            $supplierId, $periodStart, $periodEnd, $paidBy, $paymentMethod, $adjustments, $notes
        ) {
            $calculation = $this->calculateSettlement($supplierId, $periodStart, $periodEnd, $adjustments);

            $payment = Payment::create([
                'supplier_id' => $supplierId,
                'payment_type' => 'settlement',
                'amount' => max(0, $calculation['balance_due']),
                'currency' => 'LKR',
                'payment_method' => $paymentMethod,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'total_collection_amount' => $calculation['total_collection_amount'],
                'previous_advances' => $calculation['previous_advances'],
                'previous_partials' => $calculation['previous_partials'],
                'adjustments' => $adjustments,
                'balance_due' => $calculation['balance_due'],
                'payment_date' => now()->toDateString(),
                'notes' => $notes,
                'paid_by' => $paidBy,
                'status' => 'pending',
            ]);

            // Link collections to this payment
            $collectionIds = array_column($calculation['collections'], 'id');
            $collections = Collection::whereIn('id', $collectionIds)->get();
            
            foreach ($collections as $collection) {
                $payment->collections()->attach($collection->id, [
                    'id' => \Illuminate\Support\Str::uuid()->toString(),
                    'amount_applied' => $collection->net_amount,
                ]);
            }

            return $payment->fresh(['collections', 'supplier']);
        });
    }
}
