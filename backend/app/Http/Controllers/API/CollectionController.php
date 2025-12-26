<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollectionController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/collections",
     *     tags={"Collections"},
     *     summary="List all collections",
     *     description="Get paginated list of collections with filtering and sorting",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="supplier_id",
     *         in="query",
     *         description="Filter by supplier ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="product_id",
     *         in="query",
     *         description="Filter by product ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="from_date",
     *         in="query",
     *         description="Filter from date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="to_date",
     *         in="query",
     *         description="Filter to date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort by field",
     *         required=false,
     *         @OA\Schema(type="string", enum={"collection_date","quantity","total_amount","created_at","updated_at"}, default="collection_date")
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
     *         description="Results per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15, maximum=100)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="supplier_id", type="integer"),
     *                 @OA\Property(property="product_id", type="integer"),
     *                 @OA\Property(property="collection_date", type="string", format="date"),
     *                 @OA\Property(property="quantity", type="number"),
     *                 @OA\Property(property="unit", type="string"),
     *                 @OA\Property(property="rate_applied", type="number"),
     *                 @OA\Property(property="total_amount", type="number")
     *             ))
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $query = Collection::with(['supplier', 'product', 'user', 'productRate']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('from_date')) {
            $query->where('collection_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('collection_date', '<=', $request->to_date);
        }

        // Server-side sorting
        $sortBy = $request->get('sort_by', 'collection_date');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validate sort parameters
        $allowedSortFields = ['collection_date', 'quantity', 'total_amount', 'created_at', 'updated_at'];
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'collection_date';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';
        
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $collections = $query->paginate($perPage);

        return response()->json($collections);
    }

    /**
     * @OA\Post(
     *     path="/api/collections",
     *     tags={"Collections"},
     *     summary="Create a new collection",
     *     description="Create a new collection record. Rate and total amount are calculated automatically.",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"supplier_id","product_id","collection_date","quantity","unit"},
     *             @OA\Property(property="supplier_id", type="integer", example=1),
     *             @OA\Property(property="product_id", type="integer", example=1),
     *             @OA\Property(property="collection_date", type="string", format="date", example="2025-12-25"),
     *             @OA\Property(property="quantity", type="number", minimum=0.001, example=50.5),
     *             @OA\Property(property="unit", type="string", maxLength=50, example="kg"),
     *             @OA\Property(property="notes", type="string", example="Afternoon collection"),
     *             @OA\Property(property="metadata", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Collection created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="supplier_id", type="integer"),
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="collection_date", type="string", format="date"),
     *             @OA\Property(property="quantity", type="number"),
     *             @OA\Property(property="unit", type="string"),
     *             @OA\Property(property="rate_applied", type="number", description="Automatically applied rate"),
     *             @OA\Property(property="total_amount", type="number", description="Calculated as quantity * rate_applied")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'collection_date' => 'required|date',
            'quantity' => 'required|numeric|min:0.001',
            'unit' => 'required|string|max:50',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $collection = DB::transaction(function () use ($validated, $request) {
            $product = Product::findOrFail($validated['product_id']);
            $rate = $product->getCurrentRate($validated['unit'], $validated['collection_date']);

            if (!$rate) {
                throw new \Exception('No rate found for this product and unit on the specified date');
            }

            $validated['user_id'] = $request->user()->id;
            $validated['product_rate_id'] = $rate->id;
            $validated['rate_applied'] = $rate->rate;
            $validated['total_amount'] = $validated['quantity'] * $rate->rate;

            return Collection::create($validated);
        });

        return response()->json($collection->load(['supplier', 'product', 'user', 'productRate']), 201);
    }

    public function show(string $id)
    {
        $collection = Collection::with(['supplier', 'product', 'user', 'productRate'])->findOrFail($id);
        return response()->json($collection);
    }

    public function update(Request $request, string $id)
    {
        $collection = Collection::findOrFail($id);

        $validated = $request->validate([
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'product_id' => 'sometimes|required|exists:products,id',
            'collection_date' => 'sometimes|required|date',
            'quantity' => 'sometimes|required|numeric|min:0.001',
            'unit' => 'sometimes|required|string|max:50',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
            'version' => 'required|integer',
        ]);

        DB::transaction(function () use ($collection, $validated, $request) {
            if ($collection->version != $validated['version']) {
                throw new \Exception('Version mismatch. Please refresh and try again.');
            }

            if (isset($validated['product_id']) || isset($validated['unit']) || isset($validated['collection_date'])) {
                $productId = $validated['product_id'] ?? $collection->product_id;
                $unit = $validated['unit'] ?? $collection->unit;
                $date = $validated['collection_date'] ?? $collection->collection_date;

                $product = Product::findOrFail($productId);
                $rate = $product->getCurrentRate($unit, $date);

                if (!$rate) {
                    throw new \Exception('No rate found for this product and unit on the specified date');
                }

                $validated['product_rate_id'] = $rate->id;
                $validated['rate_applied'] = $rate->rate;
            }

            if (isset($validated['quantity'])) {
                $validated['total_amount'] = $validated['quantity'] * ($validated['rate_applied'] ?? $collection->rate_applied);
            }

            $validated['version'] = $collection->version + 1;
            $collection->update($validated);
        });

        return response()->json($collection->load(['supplier', 'product', 'user', 'productRate']));
    }

    public function destroy(string $id)
    {
        $collection = Collection::findOrFail($id);
        $collection->delete();

        return response()->json(['message' => 'Collection deleted successfully']);
    }
}
