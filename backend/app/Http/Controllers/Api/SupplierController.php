<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Get all suppliers
     */
    public function index(Request $request)
    {
        $query = Supplier::query();

        // Filter by active status if provided
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->orderBy('name')->paginate(50);

        return response()->json($suppliers);
    }

    /**
     * Store a new supplier
     */
    public function store(Request $request)
    {
        // Only admins and supervisors can create suppliers
        if (!$request->user()->hasAnyRole(['admin', 'supervisor'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:suppliers',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'area' => 'nullable|string|max:100',
            'is_active' => 'sometimes|boolean',
            'metadata' => 'nullable|array',
        ]);

        $supplier = Supplier::create($validated);

        return response()->json($supplier, 201);
    }

    /**
     * Get a specific supplier
     */
    public function show(Supplier $supplier)
    {
        return response()->json($supplier);
    }

    /**
     * Update a supplier
     */
    public function update(Request $request, Supplier $supplier)
    {
        // Only admins and supervisors can update suppliers
        if (!$request->user()->hasAnyRole(['admin', 'supervisor'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:suppliers,code,' . $supplier->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'area' => 'nullable|string|max:100',
            'is_active' => 'sometimes|boolean',
            'metadata' => 'nullable|array',
        ]);

        $supplier->update($validated);

        return response()->json($supplier);
    }

    /**
     * Delete a supplier
     */
    public function destroy(Request $request, Supplier $supplier)
    {
        // Only admins can delete suppliers
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted successfully']);
    }
}
