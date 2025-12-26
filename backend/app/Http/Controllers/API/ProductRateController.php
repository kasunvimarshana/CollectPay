<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductRateController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/product-rates",
     *     tags={"Product Rates"},
     *     summary="List all product rates",
     *     description="Get paginated list of product rates with optional filters and sorting",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="product_id",
     *         in="query",
     *         description="Filter by product ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="unit",
     *         in="query",
     *         description="Filter by unit",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="is_active",
     *         in="query",
     *         description="Filter by active status",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort by field",
     *         required=false,
     *         @OA\Schema(type="string", enum={"effective_date","rate","unit","created_at","updated_at"}, default="effective_date")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         description="Sort order",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc","desc"}, default="desc")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Results per page (max: 100)",
     *         required=false,
     *         @OA\Schema(type="integer", default=15, maximum=100)
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="product_id", type="integer"),
     *                 @OA\Property(property="unit", type="string"),
     *                 @OA\Property(property="rate", type="number", format="float"),
     *                 @OA\Property(property="effective_date", type="string", format="date"),
     *                 @OA\Property(property="end_date", type="string", format="date", nullable=true),
     *                 @OA\Property(property="is_active", type="boolean"),
     *                 @OA\Property(property="version", type="integer")
     *             )),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $query = ProductRate::with('product');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('unit')) {
            $query->where('unit', $request->unit);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Server-side sorting
        $sortBy = $request->get('sort_by', 'effective_date');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validate sort parameters
        $allowedSortFields = ['effective_date', 'rate', 'unit', 'created_at', 'updated_at'];
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'effective_date';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';
        
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $rates = $query->paginate($perPage);

        return response()->json($rates);
    }

    /**
     * @OA\Post(
     *     path="/api/product-rates",
     *     tags={"Product Rates"},
     *     summary="Create a new product rate",
     *     description="Create a new product rate record",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id","unit","rate","effective_date"},
     *             @OA\Property(property="product_id", type="integer", example=1),
     *             @OA\Property(property="unit", type="string", maxLength=50, example="kg"),
     *             @OA\Property(property="rate", type="number", format="float", minimum=0.01, example=120.00),
     *             @OA\Property(property="effective_date", type="string", format="date", example="2025-12-26"),
     *             @OA\Property(property="end_date", type="string", format="date", nullable=true, example=null),
     *             @OA\Property(property="metadata", type="object"),
     *             @OA\Property(property="is_active", type="boolean", default=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Product rate created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="unit", type="string"),
     *             @OA\Property(property="rate", type="number", format="float"),
     *             @OA\Property(property="effective_date", type="string", format="date"),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="version", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'unit' => 'required|string|max:50',
            'rate' => 'required|numeric|min:0.01',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after:effective_date',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $rate = DB::transaction(function () use ($validated) {
            return ProductRate::create($validated);
        });

        return response()->json($rate->load('product'), 201);
    }

    /**
     * @OA\Get(
     *     path="/api/product-rates/{id}",
     *     tags={"Product Rates"},
     *     summary="Get product rate details",
     *     description="Get a single product rate by ID with related product",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product Rate ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="unit", type="string"),
     *             @OA\Property(property="rate", type="number", format="float"),
     *             @OA\Property(property="effective_date", type="string", format="date"),
     *             @OA\Property(property="end_date", type="string", format="date", nullable=true),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="version", type="integer"),
     *             @OA\Property(property="product", type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="code", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product rate not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show(string $id)
    {
        $rate = ProductRate::with('product')->findOrFail($id);
        return response()->json($rate);
    }

    /**
     * @OA\Put(
     *     path="/api/product-rates/{id}",
     *     tags={"Product Rates"},
     *     summary="Update a product rate",
     *     description="Update an existing product rate record with version control",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product Rate ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"version"},
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="unit", type="string", maxLength=50),
     *             @OA\Property(property="rate", type="number", format="float", minimum=0.01),
     *             @OA\Property(property="effective_date", type="string", format="date"),
     *             @OA\Property(property="end_date", type="string", format="date", nullable=true),
     *             @OA\Property(property="metadata", type="object"),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="version", type="integer", description="Current version for optimistic locking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product rate updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="rate", type="number", format="float"),
     *             @OA\Property(property="version", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product rate not found"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=500, description="Version mismatch"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, string $id)
    {
        $rate = ProductRate::findOrFail($id);

        $validated = $request->validate([
            'product_id' => 'sometimes|required|exists:products,id',
            'unit' => 'sometimes|required|string|max:50',
            'rate' => 'sometimes|required|numeric|min:0.01',
            'effective_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after:effective_date',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'version' => 'required|integer',
        ]);

        DB::transaction(function () use ($rate, $validated) {
            if ($rate->version != $validated['version']) {
                throw new \Exception('Version mismatch. Please refresh and try again.');
            }

            $validated['version'] = $rate->version + 1;
            $rate->update($validated);
        });

        return response()->json($rate->load('product'));
    }

    /**
     * @OA\Delete(
     *     path="/api/product-rates/{id}",
     *     tags={"Product Rates"},
     *     summary="Delete a product rate",
     *     description="Soft delete a product rate record",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product Rate ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product rate deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Product rate deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product rate not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy(string $id)
    {
        $rate = ProductRate::findOrFail($id);
        $rate->delete();

        return response()->json(['message' => 'Product rate deleted successfully']);
    }
}
