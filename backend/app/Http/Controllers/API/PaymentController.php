<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Application\UseCases\CreatePaymentUseCase;
use App\Application\UseCases\UpdatePaymentUseCase;
use App\Application\UseCases\GetPaymentUseCase;
use App\Application\UseCases\DeletePaymentUseCase;
use App\Application\DTOs\CreatePaymentDTO;
use App\Application\DTOs\UpdatePaymentDTO;
use App\Domain\Repositories\PaymentRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;
use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    private PaymentRepositoryInterface $paymentRepository;
    private CreatePaymentUseCase $createPaymentUseCase;
    private UpdatePaymentUseCase $updatePaymentUseCase;
    private GetPaymentUseCase $getPaymentUseCase;
    private DeletePaymentUseCase $deletePaymentUseCase;

    public function __construct(
        PaymentRepositoryInterface $paymentRepository,
        CreatePaymentUseCase $createPaymentUseCase,
        UpdatePaymentUseCase $updatePaymentUseCase,
        GetPaymentUseCase $getPaymentUseCase,
        DeletePaymentUseCase $deletePaymentUseCase
    ) {
        $this->paymentRepository = $paymentRepository;
        $this->createPaymentUseCase = $createPaymentUseCase;
        $this->updatePaymentUseCase = $updatePaymentUseCase;
        $this->getPaymentUseCase = $getPaymentUseCase;
        $this->deletePaymentUseCase = $deletePaymentUseCase;
    }
    /**
     * @OA\Get(
     *     path="/api/payments",
     *     tags={"Payments"},
     *     summary="List all payments",
     *     description="Get paginated list of payments with filtering and sorting",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="supplier_id",
     *         in="query",
     *         description="Filter by supplier ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="payment_type",
     *         in="query",
     *         description="Filter by payment type",
     *         required=false,
     *         @OA\Schema(type="string", enum={"advance","partial","full"})
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
     *         @OA\Schema(type="string", enum={"payment_date","amount","payment_type","created_at","updated_at"}, default="payment_date")
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
     *         description="Successful operation"
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $filters = [
            'supplier_id' => $request->input('supplier_id'),
            'payment_type' => $request->input('payment_type'),
            'from_date' => $request->input('from_date'),
            'to_date' => $request->input('to_date'),
            'sort_by' => $request->input('sort_by', 'payment_date'),
            'sort_order' => $request->input('sort_order', 'desc'),
        ];

        $page = (int) $request->input('page', 1);
        $perPage = min((int) $request->input('per_page', 15), 100);

        $payments = $this->paymentRepository->findAll($filters, $page, $perPage);
        $total = $this->paymentRepository->count($filters);

        // Convert entities to arrays and include relationships
        $data = array_map(function($payment) {
            $paymentData = $payment->toArray();
            
            // Load relationships using original model for now
            $model = Payment::with(['supplier', 'user'])->find($payment->getId());
            
            if ($model) {
                $paymentData['supplier'] = $model->supplier;
                $paymentData['user'] = $model->user;
            }
            
            return $paymentData;
        }, $payments);

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
     *     path="/api/payments",
     *     tags={"Payments"},
     *     summary="Create a new payment",
     *     description="Create a new payment record",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"supplier_id","payment_date","amount","payment_type"},
     *             @OA\Property(property="supplier_id", type="integer", example=1),
     *             @OA\Property(property="payment_date", type="string", format="date", example="2025-12-25"),
     *             @OA\Property(property="amount", type="number", minimum=0.01, example=5000.00),
     *             @OA\Property(property="payment_type", type="string", enum={"advance","partial","full"}, example="partial"),
     *             @OA\Property(property="payment_method", type="string", maxLength=100, example="Bank Transfer"),
     *             @OA\Property(property="reference_number", type="string", maxLength=255, example="PAY-001"),
     *             @OA\Property(property="notes", type="string"),
     *             @OA\Property(property="metadata", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Payment created successfully"
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_type' => 'required|in:advance,partial,full',
            'payment_method' => 'nullable|string|max:100',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        try {
            $validated['user_id'] = $request->user()->id;
            $dto = CreatePaymentDTO::fromArray($validated);
            $payment = $this->createPaymentUseCase->execute($dto);
            
            // Load relationships for response
            $model = Payment::with(['supplier', 'user'])->find($payment->getId());
            
            return response()->json($model, 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to create payment', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create payment'], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $payment = $this->getPaymentUseCase->execute((int) $id);
            
            // Load relationships for response
            $model = Payment::with(['supplier', 'user'])->findOrFail($id);
            
            return response()->json($model);
        } catch (EntityNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            \Log::error('Failed to retrieve payment', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to retrieve payment'], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'payment_date' => 'sometimes|required|date',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'payment_type' => 'sometimes|required|in:advance,partial,full',
            'payment_method' => 'nullable|string|max:100',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
            'version' => 'required|integer',
        ]);

        try {
            $dto = UpdatePaymentDTO::fromArray((int) $id, $validated);
            $payment = $this->updatePaymentUseCase->execute($dto);
            
            // Load relationships for response
            $model = Payment::with(['supplier', 'user'])->find($payment->getId());
            
            return response()->json($model);
        } catch (EntityNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        } catch (VersionConflictException $e) {
            return response()->json(['error' => $e->getMessage()], 409);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to update payment', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update payment'], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $deleted = $this->deletePaymentUseCase->execute((int) $id);

            if (!$deleted) {
                return response()->json(['error' => 'Payment not found'], 404);
            }

            return response()->json(['message' => 'Payment deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Failed to delete payment', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to delete payment'], 500);
        }
    }

    public function getSupplierBalance(string $supplierId)
    {
        $supplier = Supplier::findOrFail($supplierId);

        $totalCollections = $supplier->getTotalCollectionsAmount();
        $totalPayments = $supplier->getTotalPaymentsAmount();
        $balance = $supplier->getBalanceAmount();

        return response()->json([
            'supplier_id' => $supplier->id,
            'supplier_name' => $supplier->name,
            'total_collections' => $totalCollections,
            'total_payments' => $totalPayments,
            'balance' => $balance,
        ]);
    }
}
