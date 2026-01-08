<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Rate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RateController extends Controller
{
    /**
     * Display a listing of rates
     *
     * @OA\Get(
     *     path="/rates",
     *     tags={"Rates"},
     *     summary="Get all rates",
     *     description="Retrieve versioned product rates with historical preservation",
     *     operationId="getRates",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="product_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="unit", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="is_active", in="query", required=false, @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="date", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Field to sort by",
     *         required=false,
     *
     *         @OA\Schema(type="string", enum={"rate","unit","effective_from","effective_to","version","created_at","updated_at"}, default="effective_from")
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
     *             @OA\Property(property="data", type="object", description="Paginated rate list with product details")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $query = Rate::with('product');

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by unit
        if ($request->has('unit')) {
            $query->where('unit', $request->unit);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Filter by date range
        if ($request->has('date')) {
            $date = $request->date;
            $query->whereDate('effective_from', '<=', $date)
                ->where(function ($q) use ($date) {
                    $q->whereNull('effective_to')
                        ->orWhereDate('effective_to', '>=', $date);
                });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'effective_from');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['rate', 'unit', 'effective_from', 'effective_to', 'version', 'created_at', 'updated_at'];

        if (in_array($sortBy, $allowedSortFields) && in_array($sortOrder, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest('effective_from');
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $rates = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $rates,
        ]);
    }

    /**
     * Store a newly created rate
     *
     * @OA\Post(
     *     path="/rates",
     *     tags={"Rates"},
     *     summary="Create new rate",
     *     description="Create a new versioned rate for a product with automatic version incrementing",
     *     operationId="createRate",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         description="Rate data with effective date range",
     *
     *         @OA\JsonContent(
     *             required={"product_id","rate","unit","effective_from"},
     *
     *             @OA\Property(property="product_id", type="integer", example=1, description="ID of the product"),
     *             @OA\Property(property="rate", type="number", format="float", example=250.00, description="Rate per unit"),
     *             @OA\Property(property="unit", type="string", example="kg", description="Unit of measurement"),
     *             @OA\Property(property="effective_from", type="string", format="date", example="2025-01-01", description="Rate effective from date"),
     *             @OA\Property(property="effective_to", type="string", format="date", nullable=true, example="2025-12-31", description="Rate effective to date (optional)"),
     *             @OA\Property(property="is_active", type="boolean", nullable=true, example=true, description="Active status")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Rate created successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Rate created successfully"),
     *             @OA\Property(property="data", type="object", description="Rate details with version number")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'rate' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Get the latest version for this product and unit
        $latestVersion = Rate::where('product_id', $request->product_id)
            ->where('unit', $request->unit)
            ->max('version') ?? 0;

        $rate = Rate::create(array_merge(
            $request->all(),
            ['version' => $latestVersion + 1]
        ));

        $rate->load('product');

        return response()->json([
            'success' => true,
            'message' => 'Rate created successfully',
            'data' => $rate,
        ], 201);
    }

    /**
     * Display the specified rate
     *
     * @OA\Get(
     *     path="/rates/{id}",
     *     tags={"Rates"},
     *     summary="Get rate by ID",
     *     description="Retrieve a specific rate with product information",
     *     operationId="getRateById",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Rate ID",
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
     *             @OA\Property(property="data", type="object", description="Rate details")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Rate not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show(Rate $rate)
    {
        $rate->load('product');

        return response()->json([
            'success' => true,
            'data' => $rate,
        ]);
    }

    /**
     * Update the specified rate
     *
     * @OA\Put(
     *     path="/rates/{id}",
     *     tags={"Rates"},
     *     summary="Update rate",
     *     description="Update rate details including effective dates and active status",
     *     operationId="updateRate",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Rate ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *         description="Updated rate data",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="product_id", type="integer", example=1),
     *             @OA\Property(property="rate", type="number", format="float", example=275.00),
     *             @OA\Property(property="unit", type="string", example="kg"),
     *             @OA\Property(property="effective_from", type="string", format="date", example="2025-01-01"),
     *             @OA\Property(property="effective_to", type="string", format="date", nullable=true, example="2025-12-31"),
     *             @OA\Property(property="is_active", type="boolean", nullable=true, example=true)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Rate updated successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Rate updated successfully"),
     *             @OA\Property(property="data", type="object", description="Updated rate details")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=404, description="Rate not found"),
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
    public function update(Request $request, Rate $rate)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|required|exists:products,id',
            'rate' => 'sometimes|required|numeric|min:0',
            'unit' => 'sometimes|required|string|max:50',
            'effective_from' => 'sometimes|required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $rate->update($request->all());
        $rate->load('product');

        return response()->json([
            'success' => true,
            'message' => 'Rate updated successfully',
            'data' => $rate,
        ]);
    }

    /**
     * Remove the specified rate
     *
     * @OA\Delete(
     *     path="/rates/{id}",
     *     tags={"Rates"},
     *     summary="Delete rate",
     *     description="Remove a rate record if it's not used in any collections",
     *     operationId="deleteRate",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Rate ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Rate deleted successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Rate deleted successfully")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=422,
     *         description="Cannot delete rate that is used in collections",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Cannot delete rate that is used in collections")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Rate not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy(Rate $rate)
    {
        // Check if rate is used in collections
        if ($rate->collections()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete rate that is used in collections',
            ], 422);
        }

        $rate->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rate deleted successfully',
        ]);
    }
}
