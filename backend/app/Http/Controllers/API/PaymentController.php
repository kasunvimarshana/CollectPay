<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
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
        $query = Payment::with(['supplier', 'user']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->has('from_date')) {
            $query->where('payment_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('payment_date', '<=', $request->to_date);
        }

        // Server-side sorting
        $sortBy = $request->get('sort_by', 'payment_date');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validate sort parameters
        $allowedSortFields = ['payment_date', 'amount', 'payment_type', 'created_at', 'updated_at'];
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'payment_date';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';
        
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $payments = $query->paginate($perPage);

        return response()->json($payments);
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

        $payment = DB::transaction(function () use ($validated, $request) {
            $validated['user_id'] = $request->user()->id;
            return Payment::create($validated);
        });

        return response()->json($payment->load(['supplier', 'user']), 201);
    }

    public function show(string $id)
    {
        $payment = Payment::with(['supplier', 'user'])->findOrFail($id);
        return response()->json($payment);
    }

    public function update(Request $request, string $id)
    {
        $payment = Payment::findOrFail($id);

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

        DB::transaction(function () use ($payment, $validated) {
            if ($payment->version != $validated['version']) {
                throw new \Exception('Version mismatch. Please refresh and try again.');
            }

            $validated['version'] = $payment->version + 1;
            $payment->update($validated);
        });

        return response()->json($payment->load(['supplier', 'user']));
    }

    public function destroy(string $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
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
