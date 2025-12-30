<?php

declare(strict_types=1);

namespace Presentation\Http\Controllers;

use Application\DTOs\CreatePaymentDTO;
use Application\UseCases\Payment\CreatePaymentUseCase;
use Application\UseCases\Payment\DeletePaymentUseCase;
use Application\UseCases\Payment\GetPaymentUseCase;
use Application\UseCases\Payment\ListPaymentsUseCase;
use Application\UseCases\Payment\CalculatePaymentTotalUseCase;
use Application\UseCases\Payment\CalculateOutstandingBalanceUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Payment Controller
 * 
 * Handles CRUD operations for payments and payment calculations.
 * Follows Clean Architecture by delegating all business logic to use cases.
 */
final class PaymentController extends Controller
{
    public function __construct(
        private readonly CreatePaymentUseCase $createPayment,
        private readonly DeletePaymentUseCase $deletePayment,
        private readonly GetPaymentUseCase $getPayment,
        private readonly ListPaymentsUseCase $listPayments,
        private readonly CalculatePaymentTotalUseCase $calculatePaymentTotal,
        private readonly CalculateOutstandingBalanceUseCase $calculateOutstandingBalance
    ) {}

    /**
     * List all payments with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'supplier_id' => 'string|uuid',
            'user_id' => 'string|uuid',
            'payment_type' => 'string|in:advance,partial,full',
            'from_date' => 'date',
            'to_date' => 'date',
        ]);

        try {
            $filters = [];
            if (isset($validated['supplier_id'])) {
                $filters['supplier_id'] = $validated['supplier_id'];
            }
            if (isset($validated['user_id'])) {
                $filters['user_id'] = $validated['user_id'];
            }
            if (isset($validated['payment_type'])) {
                $filters['payment_type'] = $validated['payment_type'];
            }
            if (isset($validated['from_date'])) {
                $filters['from_date'] = $validated['from_date'];
            }
            if (isset($validated['to_date'])) {
                $filters['to_date'] = $validated['to_date'];
            }

            $result = $this->listPayments->execute(
                page: (int) ($validated['page'] ?? 1),
                perPage: (int) ($validated['per_page'] ?? 15),
                filters: $filters
            );

            return $this->paginated([
                'data' => array_map(fn($payment) => [
                    'id' => $payment->id(),
                    'supplier_id' => $payment->supplierId(),
                    'user_id' => $payment->userId(),
                    'amount' => [
                        'amount' => $payment->amount()->amount(),
                        'currency' => $payment->amount()->currency(),
                    ],
                    'payment_type' => $payment->paymentType(),
                    'payment_date' => $payment->paymentDate()->format('Y-m-d H:i:s'),
                    'reference' => $payment->reference(),
                    'metadata' => $payment->metadata(),
                    'created_at' => $payment->createdAt()->format('Y-m-d H:i:s'),
                    'updated_at' => $payment->updatedAt()->format('Y-m-d H:i:s'),
                ], $result['data']),
                'total' => $result['total'],
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'last_page' => $result['last_page'],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to list payments: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a single payment by ID.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $payment = $this->getPayment->execute($id);

            return $this->success([
                'id' => $payment->id(),
                'supplier_id' => $payment->supplierId(),
                'user_id' => $payment->userId(),
                'amount' => [
                    'amount' => $payment->amount()->amount(),
                    'currency' => $payment->amount()->currency(),
                ],
                'payment_type' => $payment->paymentType(),
                'payment_date' => $payment->paymentDate()->format('Y-m-d H:i:s'),
                'reference' => $payment->reference(),
                'metadata' => $payment->metadata(),
                'created_at' => $payment->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $payment->updatedAt()->format('Y-m-d H:i:s'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Payment not found: ' . $e->getMessage(), 404);
        }
    }

    /**
     * Create a new payment.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id' => 'required|string|uuid',
            'user_id' => 'required|string|uuid',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'payment_type' => 'required|string|in:advance,partial,full',
            'payment_date' => 'required|date',
            'reference' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        try {
            $dto = CreatePaymentDTO::fromArray([
                'supplier_id' => $validated['supplier_id'],
                'user_id' => $validated['user_id'],
                'amount' => (float) $validated['amount'],
                'currency' => $validated['currency'],
                'payment_type' => $validated['payment_type'],
                'payment_date' => $validated['payment_date'],
                'reference' => $validated['reference'] ?? null,
                'metadata' => $validated['metadata'] ?? [],
            ]);

            $payment = $this->createPayment->execute($dto);

            return $this->created([
                'id' => $payment->id(),
                'supplier_id' => $payment->supplierId(),
                'user_id' => $payment->userId(),
                'amount' => [
                    'amount' => $payment->amount()->amount(),
                    'currency' => $payment->amount()->currency(),
                ],
                'payment_type' => $payment->paymentType(),
                'payment_date' => $payment->paymentDate()->format('Y-m-d H:i:s'),
                'reference' => $payment->reference(),
                'metadata' => $payment->metadata(),
                'created_at' => $payment->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $payment->updatedAt()->format('Y-m-d H:i:s'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to create payment: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Delete a payment.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->deletePayment->execute($id);
            return $this->noContent();
        } catch (\Exception $e) {
            return $this->error('Failed to delete payment: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Calculate total payments for a supplier.
     */
    public function calculateTotal(Request $request, string $supplierId): JsonResponse
    {
        $validated = $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        try {
            $fromDate = isset($validated['from_date']) 
                ? new \DateTimeImmutable($validated['from_date']) 
                : null;
            $toDate = isset($validated['to_date']) 
                ? new \DateTimeImmutable($validated['to_date']) 
                : null;

            $total = $this->calculatePaymentTotal->execute($supplierId, $fromDate, $toDate);

            return $this->success([
                'supplier_id' => $supplierId,
                'total_amount' => [
                    'amount' => $total->amount(),
                    'currency' => $total->currency(),
                ],
                'from_date' => $fromDate?->format('Y-m-d'),
                'to_date' => $toDate?->format('Y-m-d'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to calculate payment total: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Calculate outstanding balance for a supplier.
     */
    public function calculateBalance(Request $request, string $supplierId): JsonResponse
    {
        $validated = $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        try {
            $fromDate = isset($validated['from_date']) 
                ? new \DateTimeImmutable($validated['from_date']) 
                : null;
            $toDate = isset($validated['to_date']) 
                ? new \DateTimeImmutable($validated['to_date']) 
                : null;

            $balance = $this->calculateOutstandingBalance->execute($supplierId, $fromDate, $toDate);

            return $this->success([
                'supplier_id' => $supplierId,
                'balance' => [
                    'amount' => $balance->amount(),
                    'currency' => $balance->currency(),
                ],
                'from_date' => $fromDate?->format('Y-m-d'),
                'to_date' => $toDate?->format('Y-m-d'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to calculate balance: ' . $e->getMessage(), 422);
        }
    }
}
