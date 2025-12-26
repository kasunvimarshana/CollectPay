<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/products",
     *     tags={"Products"},
     *     summary="List all products",
     *     description="Get paginated list of products with optional search, filter, and sorting",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by name or code",
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
     *         @OA\Schema(type="string", enum={"name","code","created_at","updated_at"}, default="name")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         description="Sort order",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc","desc"}, default="asc")
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
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="code", type="string"),
     *                 @OA\Property(property="description", type="string"),
     *                 @OA\Property(property="default_unit", type="string"),
     *                 @OA\Property(property="supported_units", type="array", @OA\Items(type="string")),
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
        $query = Product::with('rates');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Server-side sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        // Validate sort parameters
        $allowedSortFields = ['name', 'code', 'created_at', 'updated_at'];
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'name';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'asc';
        
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * @OA\Post(
     *     path="/api/products",
     *     tags={"Products"},
     *     summary="Create a new product",
     *     description="Create a new product record",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","code","default_unit"},
     *             @OA\Property(property="name", type="string", maxLength=255, example="Tea Leaves"),
     *             @OA\Property(property="code", type="string", maxLength=255, example="PROD-001"),
     *             @OA\Property(property="description", type="string", example="Fresh tea leaves"),
     *             @OA\Property(property="default_unit", type="string", maxLength=50, example="kg"),
     *             @OA\Property(property="supported_units", type="array", @OA\Items(type="string"), example={"kg", "g"}),
     *             @OA\Property(property="metadata", type="object"),
     *             @OA\Property(property="is_active", type="boolean", default=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Product created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="code", type="string"),
     *             @OA\Property(property="default_unit", type="string"),
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
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:products,code',
            'description' => 'nullable|string',
            'default_unit' => 'required|string|max:50',
            'supported_units' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $product = DB::transaction(function () use ($validated) {
            return Product::create($validated);
        });

        return response()->json($product, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/products/{id}",
     *     tags={"Products"},
     *     summary="Get product details",
     *     description="Get a single product by ID with related rates",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="code", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="default_unit", type="string"),
     *             @OA\Property(property="supported_units", type="array", @OA\Items(type="string")),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="version", type="integer"),
     *             @OA\Property(property="rates", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="unit", type="string"),
     *                 @OA\Property(property="rate", type="number", format="float"),
     *                 @OA\Property(property="effective_date", type="string", format="date"),
     *                 @OA\Property(property="is_active", type="boolean")
     *             ))
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show(string $id)
    {
        $product = Product::with(['rates' => function ($query) {
            $query->orderBy('effective_date', 'desc');
        }])->findOrFail($id);

        return response()->json($product);
    }

    /**
     * @OA\Put(
     *     path="/api/products/{id}",
     *     tags={"Products"},
     *     summary="Update a product",
     *     description="Update an existing product record with version control",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"version"},
     *             @OA\Property(property="name", type="string", maxLength=255),
     *             @OA\Property(property="code", type="string", maxLength=255),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="default_unit", type="string", maxLength=50),
     *             @OA\Property(property="supported_units", type="array", @OA\Items(type="string")),
     *             @OA\Property(property="metadata", type="object"),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="version", type="integer", description="Current version for optimistic locking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="version", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=500, description="Version mismatch"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:products,code,' . $id,
            'description' => 'nullable|string',
            'default_unit' => 'sometimes|required|string|max:50',
            'supported_units' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'version' => 'required|integer',
        ]);

        DB::transaction(function () use ($product, $validated) {
            if ($product->version != $validated['version']) {
                throw new \Exception('Version mismatch. Please refresh and try again.');
            }

            $validated['version'] = $product->version + 1;
            $product->update($validated);
        });

        return response()->json($product);
    }

    /**
     * @OA\Delete(
     *     path="/api/products/{id}",
     *     tags={"Products"},
     *     summary="Delete a product",
     *     description="Soft delete a product record",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Product deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
