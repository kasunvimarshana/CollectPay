<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Supplier;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Reports",
 *     description="API Endpoints for Reports and Analytics"
 * )
 */
class ReportController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/reports/summary",
     *     summary="Get overall system summary",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Summary data retrieved successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="totalSuppliers", type="integer", example=50),
     *             @OA\Property(property="activeSuppliers", type="integer", example=45),
     *             @OA\Property(property="totalProducts", type="integer", example=20),
     *             @OA\Property(property="activeProducts", type="integer", example=18),
     *             @OA\Property(property="totalCollections", type="integer", example=1500),
     *             @OA\Property(property="totalCollectionAmount", type="number", format="float", example=125000.50),
     *             @OA\Property(property="totalPayments", type="integer", example=300),
     *             @OA\Property(property="totalPaymentAmount", type="number", format="float", example=100000.00),
     *             @OA\Property(property="outstandingBalance", type="number", format="float", example=25000.50),
     *             @OA\Property(property="collectionsThisMonth", type="integer", example=120),
     *             @OA\Property(property="paymentsThisMonth", type="integer", example=25),
     *             @OA\Property(property="collectionAmountThisMonth", type="number", format="float", example=10000.00),
     *             @OA\Property(property="paymentAmountThisMonth", type="number", format="float", example=8000.00)
     *         )
     *     )
     * )
     */
    public function summary(Request $request): JsonResponse
    {
        $totalSuppliers = Supplier::count();
        $activeSuppliers = Supplier::where('is_active', true)->count();

        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', true)->count();

        $totalCollections = Collection::count();
        $totalCollectionAmount = Collection::sum('total_amount');

        $totalPayments = Payment::count();
        $totalPaymentAmount = Payment::sum('amount');

        $outstandingBalance = $totalCollectionAmount - $totalPaymentAmount;

        // This month's data
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $collectionsThisMonth = Collection::whereBetween('collection_date', [$startOfMonth, $endOfMonth])->count();
        $collectionAmountThisMonth = Collection::whereBetween('collection_date', [$startOfMonth, $endOfMonth])->sum('total_amount');

        $paymentsThisMonth = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])->count();
        $paymentAmountThisMonth = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])->sum('amount');

        return response()->json([
            'totalSuppliers' => $totalSuppliers,
            'activeSuppliers' => $activeSuppliers,
            'totalProducts' => $totalProducts,
            'activeProducts' => $activeProducts,
            'totalCollections' => $totalCollections,
            'totalCollectionAmount' => round($totalCollectionAmount, 2),
            'totalPayments' => $totalPayments,
            'totalPaymentAmount' => round($totalPaymentAmount, 2),
            'outstandingBalance' => round($outstandingBalance, 2),
            'collectionsThisMonth' => $collectionsThisMonth,
            'paymentsThisMonth' => $paymentsThisMonth,
            'collectionAmountThisMonth' => round($collectionAmountThisMonth, 2),
            'paymentAmountThisMonth' => round($paymentAmountThisMonth, 2),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/reports/supplier-balances",
     *     summary="Get supplier balances report",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Limit number of results",
     *         required=false,
     *
     *         @OA\Schema(type="integer", example=10)
     *     ),
     *
     *     @OA\Parameter(
     *         name="sort",
     *         in="query",
     *         description="Sort by balance (asc or desc)",
     *         required=false,
     *
     *         @OA\Schema(type="string", enum={"asc", "desc"}, example="desc")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Supplier balances retrieved successfully",
     *
     *         @OA\JsonContent(
     *             type="array",
     *
     *             @OA\Items(
     *
     *                 @OA\Property(property="supplier_id", type="integer", example=1),
     *                 @OA\Property(property="supplier_name", type="string", example="John Supplier"),
     *                 @OA\Property(property="supplier_code", type="string", example="SUP001"),
     *                 @OA\Property(property="total_collections", type="number", format="float", example=50000.00),
     *                 @OA\Property(property="total_payments", type="number", format="float", example=45000.00),
     *                 @OA\Property(property="balance", type="number", format="float", example=5000.00),
     *                 @OA\Property(property="collection_count", type="integer", example=50),
     *                 @OA\Property(property="payment_count", type="integer", example=10)
     *             )
     *         )
     *     )
     * )
     */
    public function supplierBalances(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $sort = $request->input('sort', 'desc');

        $balances = Supplier::select([
            'suppliers.id as supplier_id',
            'suppliers.name as supplier_name',
            'suppliers.code as supplier_code',
            DB::raw('COALESCE(SUM(collections.total_amount), 0) as total_collections'),
            DB::raw('COALESCE(SUM(payments.amount), 0) as total_payments'),
            DB::raw('COALESCE(SUM(collections.total_amount), 0) - COALESCE(SUM(payments.amount), 0) as balance'),
            DB::raw('COUNT(DISTINCT collections.id) as collection_count'),
            DB::raw('COUNT(DISTINCT payments.id) as payment_count'),
        ])
            ->leftJoin('collections', 'suppliers.id', '=', 'collections.supplier_id')
            ->leftJoin('payments', 'suppliers.id', '=', 'payments.supplier_id')
            ->groupBy('suppliers.id', 'suppliers.name', 'suppliers.code')
            ->orderBy('balance', $sort)
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'supplier_id' => $item->supplier_id,
                    'supplier_name' => $item->supplier_name,
                    'supplier_code' => $item->supplier_code,
                    'total_collections' => round($item->total_collections, 2),
                    'total_payments' => round($item->total_payments, 2),
                    'balance' => round($item->balance, 2),
                    'collection_count' => (int) $item->collection_count,
                    'payment_count' => (int) $item->payment_count,
                ];
            });

        return response()->json($balances);
    }

    /**
     * @OA\Get(
     *     path="/api/reports/collections-summary",
     *     summary="Get collections summary by date range",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Start date (Y-m-d format)",
     *         required=false,
     *
     *         @OA\Schema(type="string", format="date", example="2025-01-01")
     *     ),
     *
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="End date (Y-m-d format)",
     *         required=false,
     *
     *         @OA\Schema(type="string", format="date", example="2025-12-31")
     *     ),
     *
     *     @OA\Parameter(
     *         name="supplier_id",
     *         in="query",
     *         description="Filter by supplier ID",
     *         required=false,
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Parameter(
     *         name="product_id",
     *         in="query",
     *         description="Filter by product ID",
     *         required=false,
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Collections summary retrieved successfully"
     *     )
     * )
     */
    public function collectionsSummary(Request $request): JsonResponse
    {
        $query = Collection::query();

        if ($request->has('start_date')) {
            $query->where('collection_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $query->where('collection_date', '<=', $request->input('end_date'));
        }

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        $totalCount = $query->count();
        $totalAmount = $query->sum('total_amount');
        $totalQuantity = $query->sum('quantity');

        $byProduct = Collection::select([
            'products.id as product_id',
            'products.name as product_name',
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(collections.quantity) as total_quantity'),
            DB::raw('SUM(collections.total_amount) as total_amount'),
        ])
            ->join('products', 'collections.product_id', '=', 'products.id')
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('collection_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('collection_date', '<=', $request->input('end_date'));
            })
            ->when($request->has('supplier_id'), function ($q) use ($request) {
                return $q->where('supplier_id', $request->input('supplier_id'));
            })
            ->groupBy('products.id', 'products.name')
            ->orderBy('total_amount', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'count' => (int) $item->count,
                    'total_quantity' => round($item->total_quantity, 3),
                    'total_amount' => round($item->total_amount, 2),
                ];
            });

        $bySupplier = Collection::select([
            'suppliers.id as supplier_id',
            'suppliers.name as supplier_name',
            'suppliers.code as supplier_code',
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(collections.quantity) as total_quantity'),
            DB::raw('SUM(collections.total_amount) as total_amount'),
        ])
            ->join('suppliers', 'collections.supplier_id', '=', 'suppliers.id')
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('collection_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('collection_date', '<=', $request->input('end_date'));
            })
            ->when($request->has('product_id'), function ($q) use ($request) {
                return $q->where('product_id', $request->input('product_id'));
            })
            ->groupBy('suppliers.id', 'suppliers.name', 'suppliers.code')
            ->orderBy('total_amount', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'supplier_id' => $item->supplier_id,
                    'supplier_name' => $item->supplier_name,
                    'supplier_code' => $item->supplier_code,
                    'count' => (int) $item->count,
                    'total_quantity' => round($item->total_quantity, 3),
                    'total_amount' => round($item->total_amount, 2),
                ];
            });

        return response()->json([
            'summary' => [
                'total_count' => $totalCount,
                'total_amount' => round($totalAmount, 2),
                'total_quantity' => round($totalQuantity, 3),
            ],
            'by_product' => $byProduct,
            'by_supplier' => $bySupplier,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/reports/payments-summary",
     *     summary="Get payments summary by date range",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Start date (Y-m-d format)",
     *         required=false,
     *
     *         @OA\Schema(type="string", format="date")
     *     ),
     *
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="End date (Y-m-d format)",
     *         required=false,
     *
     *         @OA\Schema(type="string", format="date")
     *     ),
     *
     *     @OA\Parameter(
     *         name="supplier_id",
     *         in="query",
     *         description="Filter by supplier ID",
     *         required=false,
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Payments summary retrieved successfully"
     *     )
     * )
     */
    public function paymentsSummary(Request $request): JsonResponse
    {
        $query = Payment::query();

        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->input('end_date'));
        }

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        $totalCount = $query->count();
        $totalAmount = $query->sum('amount');

        $byType = Payment::select([
            'type',
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(amount) as total_amount'),
        ])
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('payment_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('payment_date', '<=', $request->input('end_date'));
            })
            ->when($request->has('supplier_id'), function ($q) use ($request) {
                return $q->where('supplier_id', $request->input('supplier_id'));
            })
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->type,
                    'count' => (int) $item->count,
                    'total_amount' => round($item->total_amount, 2),
                ];
            });

        $bySupplier = Payment::select([
            'suppliers.id as supplier_id',
            'suppliers.name as supplier_name',
            'suppliers.code as supplier_code',
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(payments.amount) as total_amount'),
        ])
            ->join('suppliers', 'payments.supplier_id', '=', 'suppliers.id')
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('payment_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('payment_date', '<=', $request->input('end_date'));
            })
            ->groupBy('suppliers.id', 'suppliers.name', 'suppliers.code')
            ->orderBy('total_amount', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'supplier_id' => $item->supplier_id,
                    'supplier_name' => $item->supplier_name,
                    'supplier_code' => $item->supplier_code,
                    'count' => (int) $item->count,
                    'total_amount' => round($item->total_amount, 2),
                ];
            });

        return response()->json([
            'summary' => [
                'total_count' => $totalCount,
                'total_amount' => round($totalAmount, 2),
            ],
            'by_type' => $byType,
            'by_supplier' => $bySupplier,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/reports/product-performance",
     *     summary="Get product performance report",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Start date (Y-m-d format)",
     *         required=false,
     *
     *         @OA\Schema(type="string", format="date")
     *     ),
     *
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="End date (Y-m-d format)",
     *         required=false,
     *
     *         @OA\Schema(type="string", format="date")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Product performance retrieved successfully"
     *     )
     * )
     */
    public function productPerformance(Request $request): JsonResponse
    {
        $products = Product::select([
            'products.id',
            'products.name',
            'products.code',
            DB::raw('COUNT(DISTINCT collections.id) as collection_count'),
            DB::raw('COALESCE(SUM(collections.quantity), 0) as total_quantity'),
            DB::raw('COALESCE(SUM(collections.total_amount), 0) as total_amount'),
            DB::raw('COUNT(DISTINCT collections.supplier_id) as unique_suppliers'),
            DB::raw('AVG(collections.rate_applied) as avg_rate'),
        ])
            ->leftJoin('collections', function ($join) use ($request) {
                $join->on('products.id', '=', 'collections.product_id');
                if ($request->has('start_date')) {
                    $join->where('collections.collection_date', '>=', $request->input('start_date'));
                }
                if ($request->has('end_date')) {
                    $join->where('collections.collection_date', '<=', $request->input('end_date'));
                }
            })
            ->groupBy('products.id', 'products.name', 'products.code')
            ->orderBy('total_amount', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->id,
                    'product_name' => $item->name,
                    'product_code' => $item->code,
                    'collection_count' => (int) $item->collection_count,
                    'total_quantity' => round($item->total_quantity, 3),
                    'total_amount' => round($item->total_amount, 2),
                    'unique_suppliers' => (int) $item->unique_suppliers,
                    'avg_rate' => $item->avg_rate ? round($item->avg_rate, 2) : 0,
                ];
            });

        return response()->json($products);
    }

    /**
     * Get database-specific date format for month grouping
     */
    private function getMonthDateFormat(string $column): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', $column)"
            : "DATE_FORMAT($column, '%Y-%m')";
    }

    /**
     * @OA\Get(
     *     path="/api/reports/financial-summary",
     *     summary="Get comprehensive financial summary",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Start date (Y-m-d format)",
     *         required=false,
     *
     *         @OA\Schema(type="string", format="date")
     *     ),
     *
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="End date (Y-m-d format)",
     *         required=false,
     *
     *         @OA\Schema(type="string", format="date")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Financial summary retrieved successfully"
     *     )
     * )
     */
    public function financialSummary(Request $request): JsonResponse
    {
        $collectionsQuery = Collection::query();
        $paymentsQuery = Payment::query();

        if ($request->has('start_date')) {
            $collectionsQuery->where('collection_date', '>=', $request->input('start_date'));
            $paymentsQuery->where('payment_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $collectionsQuery->where('collection_date', '<=', $request->input('end_date'));
            $paymentsQuery->where('payment_date', '<=', $request->input('end_date'));
        }

        $totalCollections = $collectionsQuery->sum('total_amount');
        $totalPayments = $paymentsQuery->sum('amount');
        $netBalance = $totalCollections - $totalPayments;

        // Get monthly breakdown - using database-compatible date formatting
        $monthlyData = Collection::select([
            DB::raw("{$this->getMonthDateFormat('collection_date')} as month"),
            DB::raw('COALESCE(SUM(collections.total_amount), 0) as collections'),
            DB::raw('0 as payments'),
        ])
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('collection_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('collection_date', '<=', $request->input('end_date'));
            })
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        Payment::select([
            DB::raw("{$this->getMonthDateFormat('payment_date')} as month"),
            DB::raw('COALESCE(SUM(amount), 0) as payments'),
        ])
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('payment_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('payment_date', '<=', $request->input('end_date'));
            })
            ->groupBy('month')
            ->get()
            ->each(function ($payment) use ($monthlyData) {
                if ($monthlyData->has($payment->month)) {
                    $monthlyData[$payment->month]->payments = $payment->payments;
                } else {
                    $monthlyData[$payment->month] = (object) [
                        'month' => $payment->month,
                        'collections' => 0,
                        'payments' => $payment->payments,
                    ];
                }
            });

        $monthlyBreakdown = $monthlyData->sortKeys()->map(function ($item) {
            return [
                'month' => $item->month,
                'collections' => round($item->collections, 2),
                'payments' => round($item->payments, 2),
                'net' => round($item->collections - $item->payments, 2),
            ];
        })->values();

        return response()->json([
            'summary' => [
                'total_collections' => round($totalCollections, 2),
                'total_payments' => round($totalPayments, 2),
                'net_balance' => round($netBalance, 2),
            ],
            'monthly_breakdown' => $monthlyBreakdown,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/reports/summary/pdf",
     *     summary="Download system summary report as PDF",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="PDF downloaded successfully",
     *
     *         @OA\MediaType(mediaType="application/pdf")
     *     )
     * )
     */
    public function summaryPdf(Request $request)
    {
        $data = $this->getSummaryData($request);

        $pdf = Pdf::loadView('pdf.summary', [
            'data' => $data,
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
        ]);

        return $pdf->download('system-summary-'.date('Y-m-d').'.pdf');
    }

    /**
     * @OA\Get(
     *     path="/api/reports/supplier-balances/pdf",
     *     summary="Download supplier balances report as PDF",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Limit number of results",
     *         required=false,
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="PDF downloaded successfully",
     *
     *         @OA\MediaType(mediaType="application/pdf")
     *     )
     * )
     */
    public function supplierBalancesPdf(Request $request)
    {
        $balances = $this->getSupplierBalancesData($request);

        $pdf = Pdf::loadView('pdf.supplier-balances', [
            'balances' => $balances,
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
        ]);

        return $pdf->download('supplier-balances-'.date('Y-m-d').'.pdf');
    }

    /**
     * @OA\Get(
     *     path="/api/reports/collections-summary/pdf",
     *     summary="Download collections summary as PDF",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="PDF downloaded successfully",
     *
     *         @OA\MediaType(mediaType="application/pdf")
     *     )
     * )
     */
    public function collectionsSummaryPdf(Request $request)
    {
        $data = $this->getCollectionsSummaryData($request);

        $pdf = Pdf::loadView('pdf.collections-summary', [
            'data' => $data,
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
        ]);

        return $pdf->download('collections-summary-'.date('Y-m-d').'.pdf');
    }

    /**
     * @OA\Get(
     *     path="/api/reports/payments-summary/pdf",
     *     summary="Download payments summary as PDF",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="PDF downloaded successfully",
     *
     *         @OA\MediaType(mediaType="application/pdf")
     *     )
     * )
     */
    public function paymentsSummaryPdf(Request $request)
    {
        $data = $this->getPaymentsSummaryData($request);

        $pdf = Pdf::loadView('pdf.payments-summary', [
            'data' => $data,
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
        ]);

        return $pdf->download('payments-summary-'.date('Y-m-d').'.pdf');
    }

    /**
     * @OA\Get(
     *     path="/api/reports/product-performance/pdf",
     *     summary="Download product performance report as PDF",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="PDF downloaded successfully",
     *
     *         @OA\MediaType(mediaType="application/pdf")
     *     )
     * )
     */
    public function productPerformancePdf(Request $request)
    {
        $products = $this->getProductPerformanceData($request);

        $pdf = Pdf::loadView('pdf.product-performance', [
            'products' => $products,
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
        ]);

        return $pdf->download('product-performance-'.date('Y-m-d').'.pdf');
    }

    /**
     * @OA\Get(
     *     path="/api/reports/financial-summary/pdf",
     *     summary="Download financial summary as PDF",
     *     tags={"Reports"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="PDF downloaded successfully",
     *
     *         @OA\MediaType(mediaType="application/pdf")
     *     )
     * )
     */
    public function financialSummaryPdf(Request $request)
    {
        $data = $this->getFinancialSummaryData($request);

        $pdf = Pdf::loadView('pdf.financial-summary', [
            'data' => $data,
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
        ]);

        return $pdf->download('financial-summary-'.date('Y-m-d').'.pdf');
    }

    // Private helper methods to extract data logic
    private function getSummaryData(Request $request): array
    {
        $totalSuppliers = Supplier::count();
        $activeSuppliers = Supplier::where('is_active', true)->count();

        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', true)->count();

        $totalCollections = Collection::count();
        $totalCollectionAmount = Collection::sum('total_amount');

        $totalPayments = Payment::count();
        $totalPaymentAmount = Payment::sum('amount');

        $outstandingBalance = $totalCollectionAmount - $totalPaymentAmount;

        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $collectionsThisMonth = Collection::whereBetween('collection_date', [$startOfMonth, $endOfMonth])->count();
        $collectionAmountThisMonth = Collection::whereBetween('collection_date', [$startOfMonth, $endOfMonth])->sum('total_amount');

        $paymentsThisMonth = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])->count();
        $paymentAmountThisMonth = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])->sum('amount');

        return [
            'totalSuppliers' => $totalSuppliers,
            'activeSuppliers' => $activeSuppliers,
            'totalProducts' => $totalProducts,
            'activeProducts' => $activeProducts,
            'totalCollections' => $totalCollections,
            'totalCollectionAmount' => round($totalCollectionAmount, 2),
            'totalPayments' => $totalPayments,
            'totalPaymentAmount' => round($totalPaymentAmount, 2),
            'outstandingBalance' => round($outstandingBalance, 2),
            'collectionsThisMonth' => $collectionsThisMonth,
            'paymentsThisMonth' => $paymentsThisMonth,
            'collectionAmountThisMonth' => round($collectionAmountThisMonth, 2),
            'paymentAmountThisMonth' => round($paymentAmountThisMonth, 2),
        ];
    }

    private function getSupplierBalancesData(Request $request): array
    {
        $limit = $request->input('limit', 100);
        $sort = $request->input('sort', 'desc');

        return Supplier::select([
            'suppliers.id as supplier_id',
            'suppliers.name as supplier_name',
            'suppliers.code as supplier_code',
            DB::raw('COALESCE(SUM(collections.total_amount), 0) as total_collections'),
            DB::raw('COALESCE(SUM(payments.amount), 0) as total_payments'),
            DB::raw('COALESCE(SUM(collections.total_amount), 0) - COALESCE(SUM(payments.amount), 0) as balance'),
        ])
            ->leftJoin('collections', 'suppliers.id', '=', 'collections.supplier_id')
            ->leftJoin('payments', 'suppliers.id', '=', 'payments.supplier_id')
            ->groupBy('suppliers.id', 'suppliers.name', 'suppliers.code')
            ->orderBy('balance', $sort)
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'supplier_id' => $item->supplier_id,
                    'supplier_name' => $item->supplier_name,
                    'supplier_code' => $item->supplier_code,
                    'total_collections' => round($item->total_collections, 2),
                    'total_payments' => round($item->total_payments, 2),
                    'balance' => round($item->balance, 2),
                ];
            })
            ->toArray();
    }

    private function getCollectionsSummaryData(Request $request): array
    {
        $query = Collection::query();

        if ($request->has('start_date')) {
            $query->where('collection_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $query->where('collection_date', '<=', $request->input('end_date'));
        }

        $totalCount = $query->count();
        $totalAmount = $query->sum('total_amount');
        $totalQuantity = $query->sum('quantity');

        $byProduct = Collection::select([
            'products.id as product_id',
            'products.name as product_name',
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(collections.quantity) as total_quantity'),
            DB::raw('SUM(collections.total_amount) as total_amount'),
        ])
            ->join('products', 'collections.product_id', '=', 'products.id')
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('collection_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('collection_date', '<=', $request->input('end_date'));
            })
            ->groupBy('products.id', 'products.name')
            ->orderBy('total_amount', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'count' => (int) $item->count,
                    'total_quantity' => round($item->total_quantity, 3),
                    'total_amount' => round($item->total_amount, 2),
                ];
            })
            ->toArray();

        $bySupplier = Collection::select([
            'suppliers.id as supplier_id',
            'suppliers.name as supplier_name',
            'suppliers.code as supplier_code',
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(collections.quantity) as total_quantity'),
            DB::raw('SUM(collections.total_amount) as total_amount'),
        ])
            ->join('suppliers', 'collections.supplier_id', '=', 'suppliers.id')
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('collection_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('collection_date', '<=', $request->input('end_date'));
            })
            ->groupBy('suppliers.id', 'suppliers.name', 'suppliers.code')
            ->orderBy('total_amount', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'supplier_id' => $item->supplier_id,
                    'supplier_name' => $item->supplier_name,
                    'supplier_code' => $item->supplier_code,
                    'count' => (int) $item->count,
                    'total_quantity' => round($item->total_quantity, 3),
                    'total_amount' => round($item->total_amount, 2),
                ];
            })
            ->toArray();

        return [
            'summary' => [
                'total_count' => $totalCount,
                'total_amount' => round($totalAmount, 2),
                'total_quantity' => round($totalQuantity, 3),
            ],
            'by_product' => $byProduct,
            'by_supplier' => $bySupplier,
        ];
    }

    private function getPaymentsSummaryData(Request $request): array
    {
        $query = Payment::query();

        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->input('end_date'));
        }

        $totalCount = $query->count();
        $totalAmount = $query->sum('amount');

        $byType = Payment::select([
            'type',
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(amount) as total_amount'),
        ])
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('payment_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('payment_date', '<=', $request->input('end_date'));
            })
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->type,
                    'count' => (int) $item->count,
                    'total_amount' => round($item->total_amount, 2),
                ];
            })
            ->toArray();

        $bySupplier = Payment::select([
            'suppliers.id as supplier_id',
            'suppliers.name as supplier_name',
            'suppliers.code as supplier_code',
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(payments.amount) as total_amount'),
        ])
            ->join('suppliers', 'payments.supplier_id', '=', 'suppliers.id')
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('payment_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('payment_date', '<=', $request->input('end_date'));
            })
            ->groupBy('suppliers.id', 'suppliers.name', 'suppliers.code')
            ->orderBy('total_amount', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'supplier_id' => $item->supplier_id,
                    'supplier_name' => $item->supplier_name,
                    'supplier_code' => $item->supplier_code,
                    'count' => (int) $item->count,
                    'total_amount' => round($item->total_amount, 2),
                ];
            })
            ->toArray();

        return [
            'summary' => [
                'total_count' => $totalCount,
                'total_amount' => round($totalAmount, 2),
            ],
            'by_type' => $byType,
            'by_supplier' => $bySupplier,
        ];
    }

    private function getProductPerformanceData(Request $request): array
    {
        return Product::select([
            'products.id',
            'products.name',
            'products.code',
            DB::raw('COUNT(DISTINCT collections.id) as collection_count'),
            DB::raw('COALESCE(SUM(collections.quantity), 0) as total_quantity'),
            DB::raw('COALESCE(SUM(collections.total_amount), 0) as total_amount'),
            DB::raw('COUNT(DISTINCT collections.supplier_id) as unique_suppliers'),
            DB::raw('AVG(collections.rate_applied) as avg_rate'),
        ])
            ->leftJoin('collections', function ($join) use ($request) {
                $join->on('products.id', '=', 'collections.product_id');
                if ($request->has('start_date')) {
                    $join->where('collections.collection_date', '>=', $request->input('start_date'));
                }
                if ($request->has('end_date')) {
                    $join->where('collections.collection_date', '<=', $request->input('end_date'));
                }
            })
            ->groupBy('products.id', 'products.name', 'products.code')
            ->orderBy('total_amount', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->id,
                    'product_name' => $item->name,
                    'product_code' => $item->code,
                    'collection_count' => (int) $item->collection_count,
                    'total_quantity' => round($item->total_quantity, 3),
                    'total_amount' => round($item->total_amount, 2),
                    'unique_suppliers' => (int) $item->unique_suppliers,
                    'avg_rate' => $item->avg_rate ? round($item->avg_rate, 2) : 0,
                ];
            })
            ->toArray();
    }

    private function getFinancialSummaryData(Request $request): array
    {
        $collectionsQuery = Collection::query();
        $paymentsQuery = Payment::query();

        if ($request->has('start_date')) {
            $collectionsQuery->where('collection_date', '>=', $request->input('start_date'));
            $paymentsQuery->where('payment_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $collectionsQuery->where('collection_date', '<=', $request->input('end_date'));
            $paymentsQuery->where('payment_date', '<=', $request->input('end_date'));
        }

        $totalCollections = $collectionsQuery->sum('total_amount');
        $totalPayments = $paymentsQuery->sum('amount');
        $netBalance = $totalCollections - $totalPayments;

        $monthlyData = Collection::select([
            DB::raw("{$this->getMonthDateFormat('collection_date')} as month"),
            DB::raw('COALESCE(SUM(collections.total_amount), 0) as collections'),
            DB::raw('0 as payments'),
        ])
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('collection_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('collection_date', '<=', $request->input('end_date'));
            })
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        Payment::select([
            DB::raw("{$this->getMonthDateFormat('payment_date')} as month"),
            DB::raw('COALESCE(SUM(amount), 0) as payments'),
        ])
            ->when($request->has('start_date'), function ($q) use ($request) {
                return $q->where('payment_date', '>=', $request->input('start_date'));
            })
            ->when($request->has('end_date'), function ($q) use ($request) {
                return $q->where('payment_date', '<=', $request->input('end_date'));
            })
            ->groupBy('month')
            ->get()
            ->each(function ($payment) use ($monthlyData) {
                if ($monthlyData->has($payment->month)) {
                    $monthlyData[$payment->month]->payments = $payment->payments;
                } else {
                    $monthlyData[$payment->month] = (object) [
                        'month' => $payment->month,
                        'collections' => 0,
                        'payments' => $payment->payments,
                    ];
                }
            });

        $monthlyBreakdown = $monthlyData->sortKeys()->map(function ($item) {
            return [
                'month' => $item->month,
                'collections' => round($item->collections, 2),
                'payments' => round($item->payments, 2),
                'net' => round($item->collections - $item->payments, 2),
            ];
        })->values()->toArray();

        return [
            'summary' => [
                'total_collections' => round($totalCollections, 2),
                'total_payments' => round($totalPayments, 2),
                'net_balance' => round($netBalance, 2),
            ],
            'monthly_breakdown' => $monthlyBreakdown,
        ];
    }
}
