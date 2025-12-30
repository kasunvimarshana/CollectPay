<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Application\UseCases\Payment\CreatePaymentUseCase;
use Application\UseCases\Payment\GetPaymentUseCase;
use Application\UseCases\Payment\ListPaymentsUseCase;
use Application\UseCases\Payment\CalculateSupplierBalanceUseCase;
use Application\DTOs\CreatePaymentDTO;
use Domain\Repositories\PaymentRepositoryInterface;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository,
        private readonly CreatePaymentUseCase $createPaymentUseCase,
        private readonly GetPaymentUseCase $getPaymentUseCase,
        private readonly ListPaymentsUseCase $listPaymentsUseCase,
        private readonly CalculateSupplierBalanceUseCase $calculateSupplierBalanceUseCase
    ) {}

    /**
     * Display a listing of payments.
     */
    public function index(Request $request): JsonResponse
    {
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 20);
        $supplierId = $request->get('supplier_id');

        if ($supplierId) {
            $payments = $this->listPaymentsUseCase->executeBySupplier($supplierId, (int) $page, (int) $perPage);
        } else {
            $payments = $this->listPaymentsUseCase->execute((int) $page, (int) $perPage);
        }

        return response()->json([
            'data' => array_map(fn($payment) => $payment->toArray(), $payments),
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created payment.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id' => 'required|string|uuid',
            'type' => 'required|string|in:advance,partial,final',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|size:3',
            'payment_date' => 'required|date',
            'paid_by' => 'required|string|uuid',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        try {
            $dto = CreatePaymentDTO::fromArray($validated);
            $payment = $this->createPaymentUseCase->execute($dto);

            return response()->json([
                'message' => 'Payment created successfully',
                'data' => $payment->toArray(),
            ], 201);
        } catch (\DomainException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified payment.
     */
    public function show(string $id): JsonResponse
    {
        $payment = $this->getPaymentUseCase->execute($id);

        if (!$payment) {
            return response()->json([
                'error' => 'Payment not found',
            ], 404);
        }

        return response()->json([
            'data' => $payment->toArray(),
        ]);
    }

    /**
     * Calculate supplier balance.
     */
    public function calculateBalance(string $supplierId): JsonResponse
    {
        try {
            $balance = $this->calculateSupplierBalanceUseCase->execute($supplierId);

            return response()->json([
                'data' => $balance,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove the specified payment.
     */
    public function destroy(string $id): JsonResponse
    {
        $payment = $this->paymentRepository->findById($id);

        if (!$payment) {
            return response()->json([
                'error' => 'Payment not found',
            ], 404);
        }

        $payment->delete();
        $this->paymentRepository->save($payment);

        return response()->json([
            'message' => 'Payment deleted successfully',
        ]);
    }
}
