<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->paginate($request->input('per_page', 15));

        return response()->json($suppliers);
    }

    /**
     * Store a newly created supplier
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:suppliers,code',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        $supplier = Supplier::create($validated);

        return response()->json([
            'message' => 'Supplier created successfully',
            'supplier' => $supplier
        ], 201);
    }

    /**
     * Display the specified supplier
     */
    public function show($id)
    {
        $supplier = Supplier::with(['collections', 'payments'])->findOrFail($id);

        // Calculate total owed
        $totalOwed = $supplier->calculateTotalOwed();

        return response()->json([
            'supplier' => $supplier,
            'total_owed' => $totalOwed
        ]);
    }

    /**
     * Update the specified supplier
     */
    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        // Optimistic locking check
        if ($request->has('version') && $supplier->version != $request->input('version')) {
            throw ValidationException::withMessages([
                'version' => ['This record has been modified by another user. Please refresh and try again.']
            ]);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:suppliers,code,' . $id,
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'version' => 'integer'
        ]);

        DB::transaction(function () use ($supplier, $validated) {
            $supplier->update($validated);
            $supplier->increment('version');
        });

        return response()->json([
            'message' => 'Supplier updated successfully',
            'supplier' => $supplier->fresh()
        ]);
    }

    /**
     * Remove the specified supplier (soft delete)
     */
    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return response()->json([
            'message' => 'Supplier deleted successfully'
        ]);
    }
}
