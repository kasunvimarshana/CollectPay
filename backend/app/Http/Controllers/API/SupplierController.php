<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers
     */
    public function index(Request $request)
    {
        $query = Supplier::query();
        
        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }
        
        // Search by name, code, or region
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('region', 'like', "%{$search}%");
            });
        }
        
        // Pagination
        $perPage = $request->get('per_page', 15);
        $suppliers = $query->latest()->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $suppliers
        ]);
    }

    /**
     * Store a newly created supplier
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:suppliers',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'region' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $supplier = Supplier::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Supplier created successfully',
            'data' => $supplier
        ], 201);
    }

    /**
     * Display the specified supplier
     */
    public function show(Supplier $supplier)
    {
        return response()->json([
            'success' => true,
            'data' => $supplier
        ]);
    }

    /**
     * Update the specified supplier
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:suppliers,code,' . $supplier->id,
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'region' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $supplier->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Supplier updated successfully',
            'data' => $supplier
        ]);
    }

    /**
     * Remove the specified supplier
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return response()->json([
            'success' => true,
            'message' => 'Supplier deleted successfully'
        ]);
    }

    /**
     * Get supplier balance
     */
    public function balance(Request $request, Supplier $supplier)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        
        $balance = $supplier->balance($startDate, $endDate);
        $totalCollected = $supplier->totalCollected($startDate, $endDate);
        $totalPaid = $supplier->totalPaid($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => [
                'supplier' => $supplier,
                'total_collected' => $totalCollected,
                'total_paid' => $totalPaid,
                'balance' => $balance,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ]
            ]
        ]);
    }

    /**
     * Get supplier collections
     */
    public function collections(Request $request, Supplier $supplier)
    {
        $query = $supplier->collections()->with(['product', 'user', 'rate']);
        
        if ($request->has('start_date')) {
            $query->where('collection_date', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->where('collection_date', '<=', $request->end_date);
        }
        
        $collections = $query->latest('collection_date')->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $collections
        ]);
    }

    /**
     * Get supplier payments
     */
    public function payments(Request $request, Supplier $supplier)
    {
        $query = $supplier->payments()->with('user');
        
        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->end_date);
        }
        
        $payments = $query->latest('payment_date')->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }
}
