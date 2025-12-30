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
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Field to sort by",
     *         required=false,
     *         @OA\Schema(type="string", enum={"name","code","region","created_at","updated_at"}, default="created_at")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         description="Sort order",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc","desc"}, default="desc")
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
        
        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['name', 'code', 'region', 'created_at', 'updated_at'];
        
        if (in_array($sortBy, $allowedSortFields) && in_array($sortOrder, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest();
        }
        
        // Pagination
        $perPage = $request->get('per_page', 15);
        $suppliers = $query->paginate($perPage);
        
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
     * 
     * @OA\Get(
     *     path="/suppliers/{id}",
     *     tags={"Suppliers"},
     *     summary="Get supplier by ID",
     *     description="Retrieve a specific supplier with profile details",
     *     operationId="getSupplierById",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Supplier ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object", description="Supplier details")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Supplier not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
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
     * 
     * @OA\Put(
     *     path="/suppliers/{id}",
     *     tags={"Suppliers"},
     *     summary="Update supplier",
     *     description="Update supplier profile details with version control",
     *     operationId="updateSupplier",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Supplier ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Updated supplier data",
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="ABC Tea Suppliers Ltd"),
     *             @OA\Property(property="code", type="string", example="SUP001"),
     *             @OA\Property(property="region", type="string", example="Western"),
     *             @OA\Property(property="contact_person", type="string", example="Jane Smith"),
     *             @OA\Property(property="phone", type="string", example="+94777654321"),
     *             @OA\Property(property="email", type="string", example="updated@example.com"),
     *             @OA\Property(property="address", type="string", example="456 New Address"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Supplier updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Supplier updated successfully"),
     *             @OA\Property(property="data", type="object", description="Updated supplier details")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=404, description="Supplier not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
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
     * 
     * @OA\Delete(
     *     path="/suppliers/{id}",
     *     tags={"Suppliers"},
     *     summary="Delete supplier",
     *     description="Remove a supplier from the system",
     *     operationId="deleteSupplier",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Supplier ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Supplier deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Supplier deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Supplier not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
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
     * 
     * @OA\Get(
     *     path="/suppliers/{id}/balance",
     *     tags={"Suppliers"},
     *     summary="Get supplier balance",
     *     description="Calculate and retrieve supplier balance based on collections and payments",
     *     operationId="getSupplierBalance",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Supplier ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         required=false,
     *         description="Start date for balance calculation",
     *         @OA\Schema(type="string", format="date", example="2025-01-01")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         required=false,
     *         description="End date for balance calculation",
     *         @OA\Schema(type="string", format="date", example="2025-12-31")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="supplier", type="object", description="Supplier details"),
     *                 @OA\Property(property="total_collected", type="number", format="float", example=125000.00, description="Total amount collected"),
     *                 @OA\Property(property="total_paid", type="number", format="float", example=100000.00, description="Total amount paid"),
     *                 @OA\Property(property="balance", type="number", format="float", example=25000.00, description="Outstanding balance"),
     *                 @OA\Property(
     *                     property="period",
     *                     type="object",
     *                     @OA\Property(property="start_date", type="string", nullable=true),
     *                     @OA\Property(property="end_date", type="string", nullable=true)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=404, description="Supplier not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
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
     * 
     * @OA\Get(
     *     path="/suppliers/{id}/collections",
     *     tags={"Suppliers"},
     *     summary="Get supplier collections",
     *     description="Retrieve all collections for a specific supplier with date filtering",
     *     operationId="getSupplierCollections",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Supplier ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         required=false,
     *         description="Filter collections from this date",
     *         @OA\Schema(type="string", format="date", example="2025-01-01")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         required=false,
     *         description="Filter collections until this date",
     *         @OA\Schema(type="string", format="date", example="2025-12-31")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         required=false,
     *         description="Results per page",
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Field to sort by",
     *         required=false,
     *         @OA\Schema(type="string", enum={"collection_date","quantity","total_amount"}, default="collection_date")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         description="Sort order",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc","desc"}, default="desc")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object", description="Paginated collections with product, user, and rate details")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Supplier not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
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
        
        // Sorting
        $sortBy = $request->get('sort_by', 'collection_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['collection_date', 'quantity', 'total_amount'];
        
        if (in_array($sortBy, $allowedSortFields) && in_array($sortOrder, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest('collection_date');
        }
        
        $collections = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $collections
        ]);
    }

    /**
     * Get supplier payments
     * 
     * @OA\Get(
     *     path="/suppliers/{id}/payments",
     *     tags={"Suppliers"},
     *     summary="Get supplier payments",
     *     description="Retrieve all payments for a specific supplier with date filtering",
     *     operationId="getSupplierPayments",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Supplier ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         required=false,
     *         description="Filter payments from this date",
     *         @OA\Schema(type="string", format="date", example="2025-01-01")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         required=false,
     *         description="Filter payments until this date",
     *         @OA\Schema(type="string", format="date", example="2025-12-31")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         required=false,
     *         description="Results per page",
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Field to sort by",
     *         required=false,
     *         @OA\Schema(type="string", enum={"payment_date","amount","type"}, default="payment_date")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         description="Sort order",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc","desc"}, default="desc")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object", description="Paginated payments with user details")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Supplier not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
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
        
        // Sorting
        $sortBy = $request->get('sort_by', 'payment_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['payment_date', 'amount', 'type'];
        
        if (in_array($sortBy, $allowedSortFields) && in_array($sortOrder, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest('payment_date');
        }
        
        $payments = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }
}
