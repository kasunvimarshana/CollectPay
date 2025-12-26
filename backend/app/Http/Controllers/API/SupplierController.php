<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Application\UseCases\CreateSupplierUseCase;
use App\Application\UseCases\UpdateSupplierUseCase;
use App\Application\UseCases\GetSupplierUseCase;
use App\Application\DTOs\CreateSupplierDTO;
use App\Application\DTOs\UpdateSupplierDTO;
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SupplierController extends Controller
{
    private SupplierRepositoryInterface $supplierRepository;
    private CreateSupplierUseCase $createSupplierUseCase;
    private UpdateSupplierUseCase $updateSupplierUseCase;
    private GetSupplierUseCase $getSupplierUseCase;

    public function __construct(
        SupplierRepositoryInterface $supplierRepository,
        CreateSupplierUseCase $createSupplierUseCase,
        UpdateSupplierUseCase $updateSupplierUseCase,
        GetSupplierUseCase $getSupplierUseCase
    ) {
        $this->supplierRepository = $supplierRepository;
        $this->createSupplierUseCase = $createSupplierUseCase;
        $this->updateSupplierUseCase = $updateSupplierUseCase;
        $this->getSupplierUseCase = $getSupplierUseCase;
    }
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
        $filters = [
            'search' => $request->input('search'),
            'is_active' => $request->input('is_active'),
            'sort_by' => $request->input('sort_by', 'name'),
            'sort_order' => $request->input('sort_order', 'asc'),
        ];

        $page = (int) $request->input('page', 1);
        $perPage = min((int) $request->input('per_page', 15), 100);
        $includeBalance = $request->get('include_balance', false);

        $suppliers = $this->supplierRepository->findAll($filters, $page, $perPage);
        $total = $this->supplierRepository->count($filters);

        // Convert entities to arrays
        $data = array_map(fn($supplier) => $supplier->toArray(), $suppliers);

        // Include balance information if requested (using original model temporarily)
        if ($includeBalance) {
            foreach ($data as $index => &$supplierData) {
                $model = Supplier::find($supplierData['id']);
                if ($model) {
                    $supplierData['total_collections'] = $model->getTotalCollectionsAmount();
                    $supplierData['total_payments'] = $model->getTotalPaymentsAmount();
                    $supplierData['balance'] = $model->getBalanceAmount();
                }
            }
        }

        return response()->json([
            'data' => $data,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => ceil($total / $perPage),
        ]);
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

        try {
            $dto = CreateSupplierDTO::fromArray($validated);
            $supplier = $this->createSupplierUseCase->execute($dto);
            
            return response()->json($supplier->toArray(), 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to create supplier', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create supplier'], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $supplier = $this->getSupplierUseCase->execute((int) $id);
            
            // Get balance information using original model temporarily
            // TODO: Move this to a dedicated use case
            $model = Supplier::with(['collections', 'payments'])->findOrFail($id);
            $data = $supplier->toArray();
            $data['total_collections'] = $model->getTotalCollectionsAmount();
            $data['total_payments'] = $model->getTotalPaymentsAmount();
            $data['balance'] = $model->getBalanceAmount();

            return response()->json($data);
        } catch (EntityNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            \Log::error('Failed to retrieve supplier', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to retrieve supplier'], 500);
        }
    }

    public function update(Request $request, string $id)
    {
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

        try {
            $dto = UpdateSupplierDTO::fromArray((int) $id, $validated);
            $supplier = $this->updateSupplierUseCase->execute($dto);
            
            return response()->json($supplier->toArray());
        } catch (EntityNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        } catch (VersionConflictException $e) {
            return response()->json(['error' => $e->getMessage()], 409);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to update supplier', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update supplier'], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $deleted = $this->supplierRepository->delete((int) $id);

            if (!$deleted) {
                return response()->json(['error' => 'Supplier not found'], 404);
            }

            return response()->json(['message' => 'Supplier deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Failed to delete supplier', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to delete supplier'], 500);
        }
    }
}
