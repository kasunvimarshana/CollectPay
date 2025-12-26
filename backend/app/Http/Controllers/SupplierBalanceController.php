<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Supplier;
use App\Models\Collection;
use App\Models\Payment;

class SupplierBalanceController extends Controller
{
    /**
     * Calculate balance for a specific supplier
     */
    public function show(Request $request, $supplierId)
    {
        $supplier = Supplier::whereNull('deleted_at')->find($supplierId);

        if (!$supplier) {
            return $this->errorResponse('Supplier not found', null, 404);
        }

        $validator = Validator::make($request->all(), [
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $fromDate = $request->from_date;
        $toDate = $request->to_date;

        // Get collections with applied filter
        $collectionsQuery = Collection::where('supplier_id', $supplierId)
            ->whereNull('deleted_at');

        if ($fromDate) {
            $collectionsQuery->where('collection_date', '>=', $fromDate);
        }

        if ($toDate) {
            $collectionsQuery->where('collection_date', '<=', $toDate);
        }

        $collections = $collectionsQuery->get();

        // Calculate total collection value
        $totalCollectionValue = $collections->sum(function ($collection) {
            return $collection->quantity * $collection->applied_rate;
        });

        // Get collections by product for breakdown
        $collectionsByProduct = $collections->groupBy('product_id')->map(function ($items, $productId) {
            $product = $items->first()->product;
            return [
                'product_id' => $productId,
                'product_name' => $product->name,
                'product_code' => $product->code,
                'unit' => $product->unit,
                'total_quantity' => $items->sum('quantity'),
                'collection_count' => $items->count(),
                'total_value' => $items->sum(function ($item) {
                    return $item->quantity * $item->applied_rate;
                }),
                'collections' => $items->map(function ($collection) {
                    return [
                        'id' => $collection->id,
                        'quantity' => $collection->quantity,
                        'applied_rate' => $collection->applied_rate,
                        'value' => $collection->quantity * $collection->applied_rate,
                        'collection_date' => $collection->collection_date,
                        'notes' => $collection->notes,
                    ];
                })->values(),
            ];
        })->values();

        // Get payments with applied filter
        $paymentsQuery = Payment::where('supplier_id', $supplierId)
            ->whereNull('deleted_at');

        if ($fromDate) {
            $paymentsQuery->where('payment_date', '>=', $fromDate);
        }

        if ($toDate) {
            $paymentsQuery->where('payment_date', '<=', $toDate);
        }

        $payments = $paymentsQuery->get();

        // Calculate total payments
        $totalPayments = $payments->sum('amount');

        // Group payments by type
        $paymentsByType = $payments->groupBy('type')->map(function ($items, $type) {
            return [
                'type' => $type,
                'count' => $items->count(),
                'total_amount' => $items->sum('amount'),
                'payments' => $items->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'payment_date' => $payment->payment_date,
                        'reference_number' => $payment->reference_number,
                        'notes' => $payment->notes,
                    ];
                })->values(),
            ];
        })->values();

        // Calculate balance
        $balance = $totalCollectionValue - $totalPayments;

        $response = [
            'supplier' => [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'code' => $supplier->code,
            ],
            'period' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
            'summary' => [
                'total_collection_value' => round($totalCollectionValue, 2),
                'total_payments' => round($totalPayments, 2),
                'balance_due' => round($balance, 2),
                'collection_count' => $collections->count(),
                'payment_count' => $payments->count(),
            ],
            'collections_by_product' => $collectionsByProduct,
            'payments_by_type' => $paymentsByType,
        ];

        return $this->successResponse($response);
    }

    /**
     * Get balances for all suppliers
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $fromDate = $request->from_date;
        $toDate = $request->to_date;

        $suppliers = Supplier::whereNull('deleted_at')
            ->orderBy('name')
            ->get();

        $balances = $suppliers->map(function ($supplier) use ($fromDate, $toDate) {
            // Get collections
            $collectionsQuery = Collection::where('supplier_id', $supplier->id)
                ->whereNull('deleted_at');

            if ($fromDate) {
                $collectionsQuery->where('collection_date', '>=', $fromDate);
            }

            if ($toDate) {
                $collectionsQuery->where('collection_date', '<=', $toDate);
            }

            $collections = $collectionsQuery->get();

            $totalCollectionValue = $collections->sum(function ($collection) {
                return $collection->quantity * $collection->applied_rate;
            });

            // Get payments
            $paymentsQuery = Payment::where('supplier_id', $supplier->id)
                ->whereNull('deleted_at');

            if ($fromDate) {
                $paymentsQuery->where('payment_date', '>=', $fromDate);
            }

            if ($toDate) {
                $paymentsQuery->where('payment_date', '<=', $toDate);
            }

            $totalPayments = $paymentsQuery->sum('amount');

            // Calculate balance
            $balance = $totalCollectionValue - $totalPayments;

            return [
                'supplier_id' => $supplier->id,
                'supplier_name' => $supplier->name,
                'supplier_code' => $supplier->code,
                'total_collection_value' => round($totalCollectionValue, 2),
                'total_payments' => round($totalPayments, 2),
                'balance_due' => round($balance, 2),
                'collection_count' => $collections->count(),
                'payment_count' => $paymentsQuery->count(),
            ];
        });

        $response = [
            'period' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
            'suppliers' => $balances,
            'totals' => [
                'total_collection_value' => round($balances->sum('total_collection_value'), 2),
                'total_payments' => round($balances->sum('total_payments'), 2),
                'total_balance_due' => round($balances->sum('balance_due'), 2),
            ],
        ];

        return $this->successResponse($response);
    }
}
