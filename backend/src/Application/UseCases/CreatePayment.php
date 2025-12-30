<?php

namespace LedgerFlow\Application\UseCases;

use LedgerFlow\Domain\Entities\Payment;
use LedgerFlow\Domain\Repositories\PaymentRepositoryInterface;
use LedgerFlow\Domain\Repositories\SupplierRepositoryInterface;

class CreatePayment
{
    private PaymentRepositoryInterface $paymentRepository;
    private SupplierRepositoryInterface $supplierRepository;

    public function __construct(
        PaymentRepositoryInterface $paymentRepository,
        SupplierRepositoryInterface $supplierRepository
    ) {
        $this->paymentRepository = $paymentRepository;
        $this->supplierRepository = $supplierRepository;
    }

    public function execute(array $data): Payment
    {
        // Validate input
        $this->validate($data);

        // Verify supplier exists
        $supplier = $this->supplierRepository->findById($data['supplier_id']);
        if (!$supplier) {
            throw new \InvalidArgumentException('Supplier not found');
        }

        // Determine payment date
        $paymentDate = isset($data['payment_date'])
            ? new \DateTime($data['payment_date'])
            : new \DateTime();

        // Create payment entity
        $payment = new Payment(
            $this->generateId(),
            $data['supplier_id'],
            (float)$data['amount'],
            $paymentDate,
            $data['payment_method'] ?? 'cash',
            $data['reference'] ?? null,
            $data['notes'] ?? null,
            $data['paid_by'] ?? null
        );

        // Save to repository
        $this->paymentRepository->save($payment);

        return $payment;
    }

    private function validate(array $data): void
    {
        if (empty($data['supplier_id'])) {
            throw new \InvalidArgumentException('Supplier ID is required');
        }

        if (!isset($data['amount']) || $data['amount'] <= 0) {
            throw new \InvalidArgumentException('Amount must be greater than 0');
        }

        if (isset($data['payment_method']) && !in_array($data['payment_method'], ['cash', 'bank_transfer', 'check'])) {
            throw new \InvalidArgumentException('Invalid payment method');
        }
    }

    private function generateId(): string
    {
        return uniqid('payment_', true);
    }
}
