<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function stats()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'active')->count(),
            'total_suppliers' => Supplier::count(),
            'active_suppliers' => Supplier::where('status', 'active')->count(),
            'total_products' => Product::count(),
            'active_products' => Product::where('status', 'active')->count(),
            'total_collections' => Collection::count(),
            'collections_today' => Collection::whereDate('collection_date', today())->count(),
            'collections_this_week' => Collection::whereBetween('collection_date', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'collections_this_month' => Collection::whereMonth('collection_date', now()->month)
                ->whereYear('collection_date', now()->year)
                ->count(),
            'total_payments' => Payment::count(),
            'payments_today' => Payment::whereDate('payment_date', today())->count(),
            'payments_this_week' => Payment::whereBetween('payment_date', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'payments_this_month' => Payment::whereMonth('payment_date', now()->month)
                ->whereYear('payment_date', now()->year)
                ->count(),
            'total_collection_amount' => Collection::sum('total_amount'),
            'collection_amount_today' => Collection::whereDate('collection_date', today())->sum('total_amount'),
            'collection_amount_this_month' => Collection::whereMonth('collection_date', now()->month)
                ->whereYear('collection_date', now()->year)
                ->sum('total_amount'),
            'total_payment_amount' => Payment::sum('amount'),
            'payment_amount_today' => Payment::whereDate('payment_date', today())->sum('amount'),
            'payment_amount_this_month' => Payment::whereMonth('payment_date', now()->month)
                ->whereYear('payment_date', now()->year)
                ->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get recent collections.
     */
    public function recentCollections(Request $request)
    {
        $limit = $request->get('limit', 10);

        $collections = Collection::with(['supplier', 'product', 'collector'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $collections,
        ]);
    }

    /**
     * Get recent payments.
     */
    public function recentPayments(Request $request)
    {
        $limit = $request->get('limit', 10);

        $payments = Payment::with(['supplier', 'payer'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }
}
