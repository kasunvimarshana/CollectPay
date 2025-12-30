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
     * 
     * @OA\Get(
     *     path="/suppliers",
     *     tags={"Suppliers"},
     *     summary="Get all suppliers",
     *     description="Retrieve a paginated list of suppliers with optional filtering",
     *     operationId="getSuppliers",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="is_active",
     *         in="query",
     *         description="Filter by active status",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by name, code, or region",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Results per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
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
     * 
     * @OA\Post(
     *     path="/suppliers",
     *     tags={"Suppliers"},
     *     summary="Create new supplier",
     *     description="Create a new supplier with profile details",
     *     operationId="createSupplier",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","code"},
     *             @OA\Property(property="name", type="string", example="ABC Tea Suppliers"),
     *             @OA\Property(property="code", type="string", example="SUP001"),
     *             @OA\Property(property="region", type="string", example="Central"),
     *             @OA\Property(property="contact_person", type="string", example="John Doe"),
     *             @OA\Property(property="phone", type="string", example="+94771234567"),
     *             @OA\Property(property="email", type="string", example="supplier@example.com"),
     *             @OA\Property(property="address", type="string", example="123 Main St"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Supplier created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
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
