<?php

namespace App\Services;

use App\Events\PaymentRecorded;
use App\Models\Payment;
use App\Models\Collection;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function record(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            if (!isset($data['paid_at'])) {
                $data['paid_at'] = now();
            }
            /** @var Payment $payment */
            $payment = Payment::create($data);
            event(new PaymentRecorded($payment));
            return $payment;
        });
    }

    public function computePayable(string $supplierId): array
    {
        $total = Collection::where('supplier_id', $supplierId)
            ->get()
            ->reduce(function ($carry, $c) use ($supplierId) {
                $rate = app(CollectionService::class)->currentRate($supplierId, $c->product_id);
                if (!$rate) return $carry;
                return $carry + ((float)$c->quantity * (float)$rate->price_per_unit);
            }, 0.0);

        $paid = Payment::where('supplier_id', $supplierId)->sum('amount');
        return [
            'total' => (float) $total,
            'paid' => (float) $paid,
            'balance' => (float) max(0, $total - $paid),
        ];
    }
}
