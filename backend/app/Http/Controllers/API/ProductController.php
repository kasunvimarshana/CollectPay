<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     * 
     * @OA\Get(
     *     path="/products",
     *     tags={"Products"},
     *     summary="Get all products",
     *     description="Retrieve a paginated list of products with multi-unit support",
     *     operationId="getProducts",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="is_active", in="query", required=false, @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Field to sort by",
     *         required=false,
     *         @OA\Schema(type="string", enum={"name","code","base_unit","created_at","updated_at"}, default="created_at")
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
        $query = Product::query();
        
        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }
        
        // Search by name or code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }
        
        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['name', 'code', 'base_unit', 'created_at', 'updated_at'];
        
        if (in_array($sortBy, $allowedSortFields) && in_array($sortOrder, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest();
        }
        
        // Pagination
        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Store a newly created product
     * 
     * @OA\Post(
     *     path="/products",
     *     tags={"Products"},
     *     summary="Create new product",
     *     description="Create a new product with multi-unit support",
     *     operationId="createProduct",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","code","base_unit"},
     *             @OA\Property(property="name", type="string", example="Tea Leaves"),
     *             @OA\Property(property="code", type="string", example="PROD001"),
     *             @OA\Property(property="base_unit", type="string", example="kg"),
     *             @OA\Property(property="supported_units", type="array", @OA\Items(type="string"), example={"kg","g","lbs"}),
     *             @OA\Property(property="description", type="string", example="High quality tea leaves"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Product created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:products',
            'description' => 'nullable|string',
            'base_unit' => 'required|string|max:50',
            'supported_units' => 'nullable|array',
            'supported_units.*' => 'string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    /**
     * Display the specified product
     * 
     * @OA\Get(
     *     path="/products/{id}",
     *     tags={"Products"},
     *     summary="Get product by ID",
     *     description="Retrieve a specific product with its multi-unit configuration",
     *     operationId="getProductById",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object", description="Product details")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show(Product $product)
    {
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Update the specified product
     * 
     * @OA\Put(
     *     path="/products/{id}",
     *     tags={"Products"},
     *     summary="Update product",
     *     description="Update product details including multi-unit configuration",
     *     operationId="updateProduct",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Updated product data",
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Premium Tea Leaves"),
     *             @OA\Property(property="code", type="string", example="PROD001"),
     *             @OA\Property(property="base_unit", type="string", example="kg"),
     *             @OA\Property(property="supported_units", type="array", @OA\Items(type="string"), example={"kg","g","lbs","oz"}),
     *             @OA\Property(property="description", type="string", example="Updated description"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Product updated successfully"),
     *             @OA\Property(property="data", type="object", description="Updated product details")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:products,code,' . $product->id,
            'description' => 'nullable|string',
            'base_unit' => 'sometimes|required|string|max:50',
            'supported_units' => 'nullable|array',
            'supported_units.*' => 'string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $product->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    /**
     * Remove the specified product
     * 
     * @OA\Delete(
     *     path="/products/{id}",
     *     tags={"Products"},
     *     summary="Delete product",
     *     description="Remove a product from the system",
     *     operationId="deleteProduct",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Product deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Get current rate for the product
     * 
     * @OA\Get(
     *     path="/products/{id}/current-rate",
     *     tags={"Products"},
     *     summary="Get current product rate",
     *     description="Retrieve the current rate for a product based on date and unit",
     *     operationId="getCurrentProductRate",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="date",
     *         in="query",
     *         required=false,
     *         description="Date to check rate for (defaults to today)",
     *         @OA\Schema(type="string", format="date", example="2025-12-29")
     *     ),
     *     @OA\Parameter(
     *         name="unit",
     *         in="query",
     *         required=false,
     *         description="Unit to get rate for (defaults to product base_unit)",
     *         @OA\Schema(type="string", example="kg")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="product", type="object", description="Product details"),
     *                 @OA\Property(property="rate", type="object", description="Current rate details"),
     *                 @OA\Property(property="date", type="string", example="2025-12-29"),
     *                 @OA\Property(property="unit", type="string", example="kg")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function currentRate(Request $request, Product $product)
    {
        $date = $request->get('date');
        $unit = $request->get('unit', $product->base_unit);
        
        $rate = $product->getCurrentRate($date, $unit);

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
                'rate' => $rate,
                'date' => $date ?? now()->toDateString(),
                'unit' => $unit,
            ]
        ]);
    }

    /**
     * Get rate history for the product
     * 
     * @OA\Get(
     *     path="/products/{id}/rate-history",
     *     tags={"Products"},
     *     summary="Get product rate history",
     *     description="Retrieve the complete rate history for a product, optionally filtered by unit",
     *     operationId="getProductRateHistory",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="unit",
     *         in="query",
     *         required=false,
     *         description="Filter history by unit (optional)",
     *         @OA\Schema(type="string", example="kg")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="product", type="object", description="Product details"),
     *                 @OA\Property(property="unit", type="string", example="kg"),
     *                 @OA\Property(property="rates", type="array", @OA\Items(type="object"), description="Rate history")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function rateHistory(Request $request, Product $product)
    {
        $unit = $request->get('unit');
        $history = $product->rateHistory($unit);

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
                'unit' => $unit ?? 'all',
                'rates' => $history,
            ]
        ]);
    }
}
