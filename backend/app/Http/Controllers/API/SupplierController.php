<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/suppliers",
     *     tags={"Suppliers"},
     *     summary="List all suppliers",
     *     description="Get paginated list of suppliers with optional search, filter, and sorting",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by name, code, or email",
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
     *     @OA\Parameter(
     *         name="include_balance",
     *         in="query",
     *         description="Include balance information",
     *         required=false,
     *         @OA\Schema(type="boolean", default=false)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="code", type="string"),
     *                 @OA\Property(property="address", type="string"),
     *                 @OA\Property(property="phone", type="string"),
     *                 @OA\Property(property="email", type="string"),
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
        $query = Supplier::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
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
        $suppliers = $query->paginate($perPage);

        // Include balance information if requested
        if ($request->get('include_balance', false)) {
            $suppliers->getCollection()->transform(function ($supplier) {
                $supplier->total_collections = $supplier->getTotalCollectionsAmount();
                $supplier->total_payments = $supplier->getTotalPaymentsAmount();
                $supplier->balance = $supplier->getBalanceAmount();
                return $supplier;
            });
        }

        return response()->json($suppliers);
    }

    /**
     * @OA\Post(
     *     path="/api/suppliers",
     *     tags={"Suppliers"},
     *     summary="Create a new supplier",
     *     description="Create a new supplier record",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","code"},
     *             @OA\Property(property="name", type="string", maxLength=255, example="Green Valley Farms"),
     *             @OA\Property(property="code", type="string", maxLength=255, example="SUP-001"),
     *             @OA\Property(property="address", type="string", example="123 Valley Road, Kandy"),
     *             @OA\Property(property="phone", type="string", maxLength=50, example="+94771234567"),
     *             @OA\Property(property="email", type="string", format="email", example="greenvalley@example.com"),
     *             @OA\Property(property="metadata", type="object"),
     *             @OA\Property(property="is_active", type="boolean", default=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Supplier created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="code", type="string"),
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
            'code' => 'required|string|max:255|unique:suppliers,code',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $supplier = DB::transaction(function () use ($validated) {
            return Supplier::create($validated);
        });

        return response()->json($supplier, 201);
    }

    public function show(string $id)
    {
        $supplier = Supplier::with(['collections', 'payments'])->findOrFail($id);

        $supplier->total_collections = $supplier->getTotalCollectionsAmount();
        $supplier->total_payments = $supplier->getTotalPaymentsAmount();
        $supplier->balance = $supplier->getBalanceAmount();

        return response()->json($supplier);
    }

    public function update(Request $request, string $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:suppliers,code,' . $id,
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'version' => 'required|integer',
        ]);

        DB::transaction(function () use ($supplier, $validated) {
            if ($supplier->version != $validated['version']) {
                throw new \Exception('Version mismatch. Please refresh and try again.');
            }

            $validated['version'] = $supplier->version + 1;
            $supplier->update($validated);
        });

        return response()->json($supplier);
    }

    public function destroy(string $id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted successfully']);
    }
}
