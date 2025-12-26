<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers
     */
    public function index(Request $request)
    {
        $query = Supplier::query()->with(['creator', 'updater']);

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Filter by region
        if ($request->has('region')) {
            $query->where('region', $request->region);
        }

        $perPage = $request->get('per_page', 15);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Store a newly created supplier
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:suppliers,code',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'region' => 'nullable|string|max:100',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $supplier = DB::transaction(function () use ($validated, $request) {
            $supplier = Supplier::create([
                ...$validated,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            return $supplier->load(['creator', 'updater']);
        });

        return response()->json($supplier, 201);
    }

    /**
     * Display the specified supplier
     */
    public function show($id)
    {
        $supplier = Supplier::with(['creator', 'updater', 'collections', 'payments'])
            ->findOrFail($id);

        // Add calculated fields
        $supplier->total_collections = $supplier->totalCollections();
        $supplier->total_payments = $supplier->totalPayments();
        $supplier->outstanding_balance = $supplier->outstandingBalance();

        return response()->json($supplier);
    }

    /**
     * Update the specified supplier
     */
    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'code' => 'sometimes|required|string|unique:suppliers,code,' . $id,
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'region' => 'nullable|string|max:100',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($supplier, $validated, $request) {
            $supplier->update([
                ...$validated,
                'updated_by' => $request->user()->id,
            ]);
        });

        return response()->json($supplier->load(['creator', 'updater']));
    }

    /**
     * Remove the specified supplier
     */
    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);

        // Check if supplier has collections or payments
        if ($supplier->collections()->count() > 0 || $supplier->payments()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete supplier with existing collections or payments.',
            ], 422);
        }

        $supplier->delete();

        return response()->json([
            'message' => 'Supplier deleted successfully',
        ]);
    }

    /**
     * Get supplier balance summary
     */
    public function balance($id, Request $request)
    {
        $supplier = Supplier::findOrFail($id);

        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        return response()->json([
            'supplier' => $supplier,
            'total_collections' => $supplier->totalCollections($startDate, $endDate),
            'total_payments' => $supplier->totalPayments($startDate, $endDate),
            'outstanding_balance' => $supplier->outstandingBalance($startDate, $endDate),
        ]);
    }
}
