<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Product;
use App\Models\Rate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CollectionController extends Controller
{
    /**
     * Display a listing of collections
     *
     * @OA\Get(
     *     path="/collections",
     *     tags={"Collections"},
     *     summary="Get all collections",
     *     description="Retrieve collections with multi-unit tracking and filtering options",
     *     operationId="getCollections",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="supplier_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="product_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="user_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="start_date", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="end_date", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Field to sort by",
     *         required=false,
     *
     *         @OA\Schema(type="string", enum={"collection_date","quantity","total_amount","created_at","updated_at"}, default="collection_date")
     *     ),
     *
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         description="Sort order",
     *         required=false,
     *
     *         @OA\Schema(type="string", enum={"asc","desc"}, default="desc")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object", description="Paginated collection list with supplier, product, user, and rate details")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $query = Collection::with(['supplier', 'product', 'user', 'rate']);

        // Filter by supplier
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('collection_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('collection_date', '<=', $request->end_date);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'collection_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['collection_date', 'quantity', 'total_amount', 'created_at', 'updated_at'];

        if (in_array($sortBy, $allowedSortFields) && in_array($sortOrder, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest('collection_date');
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $collections = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $collections,
        ]);
    }

    /**
     * Store a newly created collection
     *
     * @OA\Post(
     *     path="/collections",
     *     tags={"Collections"},
     *     summary="Create new collection",
     *     description="Record a new collection with automatic rate lookup and amount calculation",
     *     operationId="createCollection",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         description="Collection data with multi-unit quantity",
     *
     *         @OA\JsonContent(
     *             required={"supplier_id","product_id","collection_date","quantity","unit"},
     *
     *             @OA\Property(property="supplier_id", type="integer", example=1, description="ID of the supplier"),
     *             @OA\Property(property="product_id", type="integer", example=1, description="ID of the product"),
     *             @OA\Property(property="collection_date", type="string", format="date", example="2025-12-29", description="Date of collection"),
     *             @OA\Property(property="quantity", type="number", format="float", example=50.5, description="Quantity collected"),
     *             @OA\Property(property="unit", type="string", example="kg", description="Unit of measurement"),
     *             @OA\Property(property="notes", type="string", nullable=true, example="Quality grade A", description="Additional notes")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Collection created successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Collection created successfully"),
     *             @OA\Property(property="data", type="object", description="Collection details with calculated amount")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error or rate not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'collection_date' => 'required|date',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $collection = DB::transaction(function () use ($request) {
                // Get authenticated user
                $userId = auth()->id();
                if (! $userId) {
                    throw new \Exception('User authentication required');
                }

                // Attempt to look up current rate; rate assignment is optional
                $product = Product::findOrFail($request->product_id);
                $rate = $product->getCurrentRate($request->collection_date, $request->unit);

                $rateId = $rate ? $rate->id : null;
                $rateApplied = $rate ? $rate->rate : null;
                $totalAmount = ($rate && $request->quantity) ? $request->quantity * $rate->rate : null;

                // Create collection (rate fields may be null when no rate is available)
                return Collection::create([
                    'supplier_id' => $request->supplier_id,
                    'product_id' => $request->product_id,
                    'user_id' => $userId,
                    'rate_id' => $rateId,
                    'collection_date' => $request->collection_date,
                    'quantity' => $request->quantity,
                    'unit' => $request->unit,
                    'rate_applied' => $rateApplied,
                    'total_amount' => $totalAmount,
                    'notes' => $request->notes,
                    'version' => 1,
                ]);
            });

            $collection->load(['supplier', 'product', 'user', 'rate']);

            return response()->json([
                'success' => true,
                'message' => 'Collection created successfully',
                'data' => $collection,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified collection
     *
     * @OA\Get(
     *     path="/collections/{id}",
     *     tags={"Collections"},
     *     summary="Get collection by ID",
     *     description="Retrieve a specific collection with related supplier, product, user, and rate information",
     *     operationId="getCollectionById",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Collection ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object", description="Collection details")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Collection not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show(Collection $collection)
    {
        $collection->load(['supplier', 'product', 'user', 'rate']);

        return response()->json([
            'success' => true,
            'data' => $collection,
        ]);
    }

    /**
     * Update the specified collection
     *
     * @OA\Put(
     *     path="/collections/{id}",
     *     tags={"Collections"},
     *     summary="Update collection",
     *     description="Update collection details with automatic recalculation of rate and amount if necessary",
     *     operationId="updateCollection",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Collection ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *         description="Updated collection data",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="supplier_id", type="integer", example=1),
     *             @OA\Property(property="product_id", type="integer", example=1),
     *             @OA\Property(property="collection_date", type="string", format="date", example="2025-12-29"),
     *             @OA\Property(property="quantity", type="number", format="float", example=55.0),
     *             @OA\Property(property="unit", type="string", example="kg"),
     *             @OA\Property(property="notes", type="string", nullable=true, example="Updated notes")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Collection updated successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Collection updated successfully"),
     *             @OA\Property(property="data", type="object", description="Updated collection with recalculated amount")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=404, description="Collection not found"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(
     *         response=409,
     *         description="Version conflict - resource was modified by another user",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Version conflict detected")
     *         )
     *     )
     * )
     */
    public function update(Request $request, Collection $collection)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'product_id' => 'sometimes|required|exists:products,id',
            'collection_date' => 'sometimes|required|date',
            'quantity' => 'sometimes|required|numeric|min:0',
            'unit' => 'sometimes|required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::transaction(function () use ($request, $collection) {
                // If product, date, or unit changed, attempt to re-lookup the rate
                if ($request->hasAny(['product_id', 'collection_date', 'unit'])) {
                    $productId = $request->get('product_id', $collection->product_id);
                    $date = $request->get('collection_date', $collection->collection_date);
                    $unit = $request->get('unit', $collection->unit);

                    $product = Product::findOrFail($productId);
                    $rate = $product->getCurrentRate($date, $unit);

                    if ($rate) {
                        $collection->rate_id = $rate->id;
                        $collection->rate_applied = $rate->rate;
                    }
                }

                // Update quantity if provided
                if ($request->has('quantity')) {
                    $collection->quantity = $request->quantity;
                }

                // Recalculate total amount only when a rate has been assigned
                $collection->total_amount = $collection->hasRate()
                    ? $collection->quantity * $collection->rate_applied
                    : null;

                // Update other fields
                $collection->fill($request->only(['supplier_id', 'product_id', 'collection_date', 'unit', 'notes']));

                // Increment version for concurrency control
                $collection->version++;
                $collection->save();
            });

            $collection->load(['supplier', 'product', 'user', 'rate']);

            return response()->json([
                'success' => true,
                'message' => 'Collection updated successfully',
                'data' => $collection,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Apply a rate to an existing collection
     *
     * @OA\Post(
     *     path="/collections/{id}/apply-rate",
     *     tags={"Collections"},
     *     summary="Apply rate to collection",
     *     description="Apply a rate to a collection that was created without one, or update the existing rate. The rate is looked up automatically based on the collection date and unit unless a specific rate_id is provided.",
     *     operationId="applyRateToCollection",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Collection ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=false,
     *         description="Optional rate override",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="rate_id", type="integer", nullable=true, example=1, description="Specific rate ID to apply. If omitted, the current rate is looked up automatically.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Rate applied successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Rate applied successfully"),
     *             @OA\Property(property="data", type="object", description="Updated collection with rate and calculated total")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="No valid rate found"),
     *     @OA\Response(response=404, description="Collection not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function applyRate(Request $request, Collection $collection)
    {
        $validator = Validator::make($request->all(), [
            'rate_id' => 'nullable|exists:rates,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::transaction(function () use ($request, $collection) {
                if ($request->filled('rate_id')) {
                    $rate = Rate::findOrFail($request->rate_id);
                } else {
                    $product = Product::findOrFail($collection->product_id);
                    $rate = $product->getCurrentRate($collection->collection_date, $collection->unit);
                }

                if (! $rate) {
                    throw new \Exception('No valid rate found for this collection\'s product, date, and unit');
                }

                $collection->rate_id = $rate->id;
                $collection->rate_applied = $rate->rate;
                $collection->total_amount = $collection->quantity * $rate->rate;
                $collection->version++;
                $collection->save();
            });

            $collection->load(['supplier', 'product', 'user', 'rate']);

            return response()->json([
                'success' => true,
                'message' => 'Rate applied successfully',
                'data' => $collection,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Apply rates to multiple collections in bulk
     *
     * @OA\Post(
     *     path="/collections/bulk-apply-rate",
     *     tags={"Collections"},
     *     summary="Bulk apply rates to collections",
     *     description="Apply current rates to a list of collections that are missing a rate. For each collection the rate is looked up automatically based on its product, date, and unit. Collections that already have a rate are skipped. Returns per-collection results.",
     *     operationId="bulkApplyRateToCollections",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         description="List of collection IDs to process",
     *
     *         @OA\JsonContent(
     *             required={"collection_ids"},
     *
     *             @OA\Property(
     *                 property="collection_ids",
     *                 type="array",
     *
     *                 @OA\Items(type="integer"),
     *                 example={1,2,3},
     *                 description="IDs of collections to apply rates to"
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Bulk operation completed",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Rates applied to 3 of 5 collections"),
     *             @OA\Property(property="applied_count", type="integer", example=3),
     *             @OA\Property(property="skipped_count", type="integer", example=2),
     *             @OA\Property(
     *                 property="results",
     *                 type="array",
     *
     *                 @OA\Items(
     *
     *                     @OA\Property(property="collection_id", type="integer"),
     *                     @OA\Property(property="status", type="string", enum={"applied","skipped","error"}),
     *                     @OA\Property(property="message", type="string")
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function bulkApplyRate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'collection_ids' => 'required|array|min:1',
            'collection_ids.*' => 'required|integer|exists:collections,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $results = [];
        $appliedCount = 0;
        $skippedCount = 0;

        $collections = Collection::whereIn('id', $request->collection_ids)->get();

        foreach ($collections as $collection) {
            if ($collection->hasRate()) {
                $results[] = [
                    'collection_id' => $collection->id,
                    'status' => 'skipped',
                    'message' => 'Rate already applied',
                ];
                $skippedCount++;
                continue;
            }

            try {
                DB::transaction(function () use ($collection) {
                    $product = Product::findOrFail($collection->product_id);
                    $rate = $product->getCurrentRate($collection->collection_date, $collection->unit);

                    if (! $rate) {
                        throw new \Exception('No valid rate found');
                    }

                    $collection->rate_id = $rate->id;
                    $collection->rate_applied = $rate->rate;
                    $collection->total_amount = $collection->quantity * $rate->rate;
                    $collection->version++;
                    $collection->save();
                });

                $results[] = [
                    'collection_id' => $collection->id,
                    'status' => 'applied',
                    'message' => 'Rate applied successfully',
                ];
                $appliedCount++;
            } catch (\Exception $e) {
                $message = $e->getMessage() === 'No valid rate found'
                    ? 'No valid rate found for this collection\'s product, date, and unit'
                    : 'Failed to apply rate';
                $results[] = [
                    'collection_id' => $collection->id,
                    'status' => 'error',
                    'message' => $message,
                ];
                $skippedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Rates applied to {$appliedCount} of " . count($request->collection_ids) . ' collections',
            'applied_count' => $appliedCount,
            'skipped_count' => $skippedCount,
            'results' => $results,
        ]);
    }

    /**
     * Remove the specified collection
     *
     * @OA\Delete(
     *     path="/collections/{id}",
     *     tags={"Collections"},
     *     summary="Delete collection",
     *     description="Remove a collection record from the system",
     *     operationId="deleteCollection",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Collection ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Collection deleted successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Collection deleted successfully")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Collection not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy(Collection $collection)
    {
        $collection->delete();

        return response()->json([
            'success' => true,
            'message' => 'Collection deleted successfully',
        ]);
    }
}
