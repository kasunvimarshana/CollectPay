<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SuppliersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Supplier::query();
        $user = $request->user();
        if (!$user->hasAnyRole(['admin','manager']) && !$user->attr('allow_all_suppliers', false)) {
            $ids = (array) $user->attr('allowed_supplier_ids', []);
            if (!empty($ids)) {
                $query->whereIn('id', $ids);
            } else {
                $query->whereRaw('1=0');
            }
        }
        return $query->orderBy('name')->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSupplierRequest $request)
    {
        $supplier = Supplier::create($request->validated());
        return response()->json($supplier, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        return $supplier;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $supplier->update($request->validated());
        return $supplier;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return response()->noContent();
    }

    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->authorizeResource(Supplier::class, 'supplier');
    }
}
