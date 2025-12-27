<?php

declare(strict_types=1);

namespace TrackVault\Presentation\Controllers;

use TrackVault\Domain\Repositories\PaymentRepositoryInterface;
use TrackVault\Domain\Entities\Payment;
use TrackVault\Domain\ValueObjects\PaymentId;
use TrackVault\Domain\ValueObjects\SupplierId;
use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Money;
use Exception;

/**
 * Payment Controller
 * 
 * Handles payment CRUD operations
 */
final class PaymentController extends BaseController
{
    private PaymentRepositoryInterface $paymentRepository;

    public function __construct(PaymentRepositoryInterface $paymentRepository)
    {
        $this->paymentRepository = $paymentRepository;
    }

    public function index(): void
    {
        try {
            $limit = (int)($_GET['limit'] ?? 100);
            $offset = (int)($_GET['offset'] ?? 0);
            
            $payments = $this->paymentRepository->findAll($limit, $offset);
            
            $data = array_map(fn($payment) => $payment->toArray(), $payments);
            
            $this->successResponse($data);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'FETCH_FAILED', 500);
        }
    }

    public function show(string $id): void
    {
        try {
            $payment = $this->paymentRepository->findById(new PaymentId($id));
            
            if (!$payment) {
                $this->errorResponse('Payment not found', 'NOT_FOUND', 404);
                return;
            }
            
            $this->successResponse($payment->toArray());
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'FETCH_FAILED', 500);
        }
    }

    public function store(): void
    {
        try {
            $data = $this->getRequestBody();
            
            // Validation
            $required = ['supplier_id', 'processed_by', 'amount', 'type', 'payment_method', 'payment_date'];
            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    $this->errorResponse("Field '{$field}' is required", 'VALIDATION_ERROR', 400);
                    return;
                }
            }

            // Validate payment type
            $validTypes = ['advance', 'partial', 'full'];
            if (!in_array($data['type'], $validTypes)) {
                $this->errorResponse('Invalid payment type. Must be: advance, partial, or full', 'VALIDATION_ERROR', 400);
                return;
            }

            $payment = new Payment(
                PaymentId::generate(),
                new SupplierId($data['supplier_id']),
                new UserId($data['processed_by']),
                new Money((float)$data['amount'], $data['currency'] ?? 'USD'),
                $data['type'],
                $data['payment_method'],
                $data['reference'] ?? null,
                new \DateTimeImmutable($data['payment_date']),
                $data['metadata'] ?? []
            );

            $this->paymentRepository->save($payment);
            
            $this->successResponse($payment->toArray(), 'Payment created successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'CREATE_FAILED', 400);
        }
    }

    public function update(string $id): void
    {
        try {
            $payment = $this->paymentRepository->findById(new PaymentId($id));
            
            if (!$payment) {
                $this->errorResponse('Payment not found', 'NOT_FOUND', 404);
                return;
            }

            $data = $this->getRequestBody();
            
            // Validate payment type if provided
            if (isset($data['type'])) {
                $validTypes = ['advance', 'partial', 'full'];
                if (!in_array($data['type'], $validTypes)) {
                    $this->errorResponse('Invalid payment type. Must be: advance, partial, or full', 'VALIDATION_ERROR', 400);
                    return;
                }
            }

            // Create updated payment
            $updatedPayment = new Payment(
                $payment->getId(),
                isset($data['supplier_id']) ? new SupplierId($data['supplier_id']) : $payment->getSupplierId(),
                isset($data['processed_by']) ? new UserId($data['processed_by']) : $payment->getProcessedBy(),
                isset($data['amount']) ? new Money((float)$data['amount'], $data['currency'] ?? $payment->getAmount()->getCurrency()) : $payment->getAmount(),
                $data['type'] ?? $payment->getType(),
                $data['payment_method'] ?? $payment->getPaymentMethod(),
                $data['reference'] ?? $payment->getReference(),
                isset($data['payment_date']) ? new \DateTimeImmutable($data['payment_date']) : $payment->getPaymentDate(),
                $data['metadata'] ?? $payment->getMetadata(),
                $payment->getCreatedAt(),
                new \DateTimeImmutable(),
                null,
                $payment->getVersion() + 1
            );

            $this->paymentRepository->save($updatedPayment);
            
            $this->successResponse($updatedPayment->toArray(), 'Payment updated successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'UPDATE_FAILED', 400);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $payment = $this->paymentRepository->findById(new PaymentId($id));
            
            if (!$payment) {
                $this->errorResponse('Payment not found', 'NOT_FOUND', 404);
                return;
            }

            $this->paymentRepository->delete(new PaymentId($id));
            
            $this->successResponse(null, 'Payment deleted successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'DELETE_FAILED', 400);
        }
    }

    public function bySupplier(string $supplierId): void
    {
        try {
            $payments = $this->paymentRepository->findBySupplierId(new SupplierId($supplierId));
            
            $data = array_map(fn($payment) => $payment->toArray(), $payments);
            
            $this->successResponse($data);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'FETCH_FAILED', 500);
        }
    }
}
