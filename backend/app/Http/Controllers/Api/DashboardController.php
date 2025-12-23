<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Payment;
use App\Models\Supplier;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $userId = $request->user()->id;
        $isCollector = $request->user()->isCollector();

        $stats = [
            'total_suppliers' => Supplier::where('is_active', true)->count(),
            'total_products' => Product::where('is_active', true)->count(),
            'total_collections' => $isCollector 
                ? Collection::where('collector_id', $userId)->count()
                : Collection::count(),
            'total_payments' => Payment::count(),
            'collections_today' => $isCollector
                ? Collection::where('collector_id', $userId)->whereDate('collected_at', today())->count()
                : Collection::whereDate('collected_at', today())->count(),
            'collections_this_week' => $isCollector
                ? Collection::where('collector_id', $userId)->whereBetween('collected_at', [now()->startOfWeek(), now()->endOfWeek()])->count()
                : Collection::whereBetween('collected_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'total_collection_amount' => $isCollector
                ? Collection::where('collector_id', $userId)->sum('amount')
                : Collection::sum('amount'),
            'total_payment_amount' => Payment::sum('amount'),
        ];

        if (!$isCollector) {
            $stats['suppliers_with_balance'] = Supplier::whereHas('balance', function ($q) {
                $q->where('balance', '>', 0);
            })->count();

            $stats['total_outstanding'] = DB::table('supplier_balances')
                ->where('balance', '>', 0)
                ->sum('balance');
        }

        return response()->json($stats);
    }

    public function recentActivity(Request $request)
    {
        $userId = $request->user()->id;
        $isCollector = $request->user()->isCollector();

        $recentCollections = $isCollector
            ? Collection::where('collector_id', $userId)->with(['supplier', 'product'])->latest('collected_at')->limit(10)->get()
            : Collection::with(['supplier', 'product', 'collector'])->latest('collected_at')->limit(10)->get();

        $recentPayments = Payment::with(['supplier', 'processor'])
            ->latest('payment_date')
            ->limit(10)
            ->get();

        return response()->json([
            'recent_collections' => $recentCollections,
            'recent_payments' => $recentPayments,
        ]);
    }
}
