<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments
     *
     * @OA\Get(
     *     path="/payments",
     *     tags={"Payments"},
     *     summary="Get all payments",
     *     description="Retrieve payments with filtering for advance, partial, and full payments",
     *     operationId="getPayments",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="supplier_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="user_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="type", in="query", required=false, @OA\Schema(type="string", enum={"advance","partial","full"})),
     *     @OA\Parameter(name="start_date", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="end_date", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Field to sort by",
     *         required=false,
     *
     *         @OA\Schema(type="string", enum={"payment_date","amount","type","created_at","updated_at"}, default="payment_date")
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
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $query = Payment::with(['supplier', 'user']);

        // Filter by supplier
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by payment type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->end_date);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'payment_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['payment_date', 'amount', 'type', 'created_at', 'updated_at'];

        if (in_array($sortBy, $allowedSortFields) && in_array($sortOrder, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest('payment_date');
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $payments = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    /**
     * Store a newly created payment
     *
     * @OA\Post(
     *     path="/payments",
     *     tags={"Payments"},
     *     summary="Create new payment",
     *     description="Record a new payment (advance, partial, full, or adjustment) for a supplier",
     *     operationId="createPayment",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         description="Payment data",
     *
     *         @OA\JsonContent(
     *             required={"supplier_id","payment_date","amount","type"},
     *
     *             @OA\Property(property="supplier_id", type="integer", example=1, description="ID of the supplier"),
     *             @OA\Property(property="payment_date", type="string", format="date", example="2025-12-29", description="Date of payment"),
     *             @OA\Property(property="amount", type="number", format="float", example=5000.00, description="Payment amount"),
     *             @OA\Property(property="type", type="string", enum={"advance","partial","full","adjustment"}, example="partial", description="Type of payment"),
     *             @OA\Property(property="reference_number", type="string", nullable=true, example="PAY-2025-001", description="Payment reference number"),
     *             @OA\Property(property="payment_method", type="string", nullable=true, example="bank_transfer", description="Payment method used"),
     *             @OA\Property(property="notes", type="string", nullable=true, example="Payment for December collection", description="Additional notes")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Payment created successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Payment created successfully"),
     *             @OA\Property(property="data", type="object", description="Payment details")
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
            'supplier_id' => 'required|exists:suppliers,id',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|in:advance,partial,full,adjustment',
            'reference_number' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $payment = DB::transaction(function () use ($request) {
                // Get authenticated user
                $userId = auth()->id();
                if (! $userId) {
                    throw new \Exception('User authentication required');
                }

                return Payment::create([
                    'supplier_id' => $request->supplier_id,
                    'user_id' => $userId,
                    'payment_date' => $request->payment_date,
                    'amount' => $request->amount,
                    'type' => $request->type,
                    'reference_number' => $request->reference_number,
                    'payment_method' => $request->payment_method,
                    'notes' => $request->notes,
                    'version' => 1,
                ]);
            });

            $payment->load(['supplier', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Payment created successfully',
                'data' => $payment,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified payment
     *
     * @OA\Get(
     *     path="/payments/{id}",
     *     tags={"Payments"},
     *     summary="Get payment by ID",
     *     description="Retrieve a specific payment with related supplier and user information",
     *     operationId="getPaymentById",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Payment ID",
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
     *             @OA\Property(property="data", type="object", description="Payment details")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Payment not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show(Payment $payment)
    {
        $payment->load(['supplier', 'user']);

        return response()->json([
            'success' => true,
            'data' => $payment,
        ]);
    }

    /**
     * Update the specified payment
     *
     * @OA\Put(
     *     path="/payments/{id}",
     *     tags={"Payments"},
     *     summary="Update payment",
     *     description="Update payment details with version control for concurrency",
     *     operationId="updatePayment",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Payment ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *         description="Updated payment data",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="supplier_id", type="integer", example=1),
     *             @OA\Property(property="payment_date", type="string", format="date", example="2025-12-29"),
     *             @OA\Property(property="amount", type="number", format="float", example=5500.00),
     *             @OA\Property(property="type", type="string", enum={"advance","partial","full","adjustment"}, example="partial"),
     *             @OA\Property(property="reference_number", type="string", nullable=true, example="PAY-2025-001-REV"),
     *             @OA\Property(property="payment_method", type="string", nullable=true, example="cash"),
     *             @OA\Property(property="notes", type="string", nullable=true, example="Updated payment notes")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Payment updated successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Payment updated successfully"),
     *             @OA\Property(property="data", type="object", description="Updated payment details")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=404, description="Payment not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, Payment $payment)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'payment_date' => 'sometimes|required|date',
            'amount' => 'sometimes|required|numeric|min:0',
            'type' => 'sometimes|required|in:advance,partial,full,adjustment',
            'reference_number' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::transaction(function () use ($request, $payment) {
                $payment->fill($request->all());

                // Increment version for concurrency control
                $payment->version++;
                $payment->save();
            });

            $payment->load(['supplier', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Payment updated successfully',
                'data' => $payment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove the specified payment
     *
     * @OA\Delete(
     *     path="/payments/{id}",
     *     tags={"Payments"},
     *     summary="Delete payment",
     *     description="Remove a payment record from the system",
     *     operationId="deletePayment",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Payment ID",
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Payment deleted successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Payment deleted successfully")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Payment not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payment deleted successfully',
        ]);
    }
}
