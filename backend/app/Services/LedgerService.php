<?php

namespace App\Services;

use App\Models\CollectionEntry;
use App\Models\Payment;
use App\Models\Rate;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;

class LedgerService
{
    /**
     * @return array<string, mixed>
     */
    public function supplierLedger(string $supplierId, ?string $fromDate, ?string $toDate): array
    {
        $from = $fromDate ? CarbonImmutable::parse($fromDate)->startOfDay() : null;
        $to = $toDate ? CarbonImmutable::parse($toDate)->endOfDay() : null;

        $collectionsQuery = CollectionEntry::query()
            ->with(['product', 'unit'])
            ->where('supplier_id', $supplierId);

        $paymentsQuery = Payment::query()
            ->where('supplier_id', $supplierId);

        if ($from !== null) {
            $collectionsQuery->where('collected_at', '>=', $from);
            $paymentsQuery->where('paid_at', '>=', $from);
        }
        if ($to !== null) {
            $collectionsQuery->where('collected_at', '<=', $to);
            $paymentsQuery->where('paid_at', '<=', $to);
        }

        $collections = $collectionsQuery->orderBy('collected_at')->get();
        $payments = $paymentsQuery->orderBy('paid_at')->get();

        $collectionsWithAmounts = [];
        $collectionsTotal = 0.0;

        foreach ($collections as $entry) {
            $ratePerBase = $this->getRatePerBaseFor($entry->product_id, CarbonImmutable::parse($entry->collected_at));
            $amount = $ratePerBase !== null ? ((float) $entry->quantity_in_base) * $ratePerBase : 0.0;

            $collectionsTotal += $amount;

            $collectionsWithAmounts[] = [
                'id' => $entry->id,
                'product_id' => $entry->product_id,
                'product_name' => $entry->product?->name,
                'unit_id' => $entry->unit_id,
                'unit_code' => $entry->unit?->code,
                'quantity' => (string) $entry->quantity,
                'quantity_in_base' => (string) $entry->quantity_in_base,
                'collected_at' => $entry->collected_at?->toIso8601String(),
                'rate_per_base' => $ratePerBase,
                'amount' => $amount,
            ];
        }

        $paymentsTotal = (float) $payments->sum('amount');
        $balance = $collectionsTotal - $paymentsTotal;

        return [
            'supplier_id' => $supplierId,
            'period' => [
                'from' => $from?->toDateString(),
                'to' => $to?->toDateString(),
            ],
            'totals' => [
                'collections_total' => $collectionsTotal,
                'payments_total' => $paymentsTotal,
                'balance_due' => $balance,
            ],
            'collections' => $collectionsWithAmounts,
            'payments' => $payments->map(fn ($p) => Arr::only($p->toArray(), ['id', 'type', 'amount', 'paid_at', 'notes', 'entered_by_user_id']))->all(),
        ];
    }

    private function getRatePerBaseFor(string $productId, CarbonImmutable $at): ?float
    {
        $date = $at->toDateString();

        $rate = Rate::query()
            ->where('product_id', $productId)
            ->where('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_to')->orWhere('effective_to', '>=', $date);
            })
            ->orderByDesc('effective_from')
            ->first();

        if ($rate === null) {
            return null;
        }

        return (float) $rate->rate_per_base;
    }
}
