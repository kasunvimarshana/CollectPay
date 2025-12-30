<?php

namespace LedgerFlow\Presentation\Controllers;

use LedgerFlow\Application\UseCases\CreatePayment;
use LedgerFlow\Domain\Repositories\PaymentRepositoryInterface;

class PaymentController
{
    private PaymentRepositoryInterface $paymentRepository;
    private CreatePayment $createPayment;

    public function __construct(
        PaymentRepositoryInterface $paymentRepository,
        CreatePayment $createPayment
    ) {
        $this->paymentRepository = $paymentRepository;
        $this->createPayment = $createPayment;
    }

    public function index(): void
    {
        try {
            $payments = $this->paymentRepository->findAll();
            $paymentsData = array_map(function ($payment) {
                return [
                    'id' => $payment->getId(),
                    'supplier_id' => $payment->getSupplierId(),
                    'amount' => $payment->getAmount(),
                    'payment_date' => $payment->getPaymentDate()->format('Y-m-d'),
                    'payment_method' => $payment->getPaymentMethod(),
                    'reference' => $payment->getReference(),
                    'notes' => $payment->getNotes(),
                    'paid_by' => $payment->getPaidBy(),
                    'created_at' => $payment->getCreatedAt()->format('Y-m-d H:i:s'),
                    'updated_at' => $payment->getUpdatedAt()->format('Y-m-d H:i:s')
                ];
            }, $payments);

            http_response_code(200);
            echo json_encode($paymentsData);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function show(string $id): void
    {
        try {
            $payment = $this->paymentRepository->findById($id);

            if (!$payment) {
                http_response_code(404);
                echo json_encode(['error' => 'Payment not found']);
                return;
            }

            http_response_code(200);
            echo json_encode([
                'id' => $payment->getId(),
                'supplier_id' => $payment->getSupplierId(),
                'amount' => $payment->getAmount(),
                'payment_date' => $payment->getPaymentDate()->format('Y-m-d'),
                'payment_method' => $payment->getPaymentMethod(),
                'reference' => $payment->getReference(),
                'notes' => $payment->getNotes(),
                'paid_by' => $payment->getPaidBy(),
                'created_at' => $payment->getCreatedAt()->format('Y-m-d H:i:s'),
                'updated_at' => $payment->getUpdatedAt()->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function store(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $payment = $this->createPayment->execute($data);

            http_response_code(201);
            echo json_encode([
                'id' => $payment->getId(),
                'supplier_id' => $payment->getSupplierId(),
                'amount' => $payment->getAmount(),
                'payment_date' => $payment->getPaymentDate()->format('Y-m-d'),
                'payment_method' => $payment->getPaymentMethod(),
                'reference' => $payment->getReference(),
                'notes' => $payment->getNotes(),
                'paid_by' => $payment->getPaidBy(),
                'created_at' => $payment->getCreatedAt()->format('Y-m-d H:i:s')
            ]);
        } catch (\InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function update(string $id): void
    {
        try {
            $payment = $this->paymentRepository->findById($id);

            if (!$payment) {
                http_response_code(404);
                echo json_encode(['error' => 'Payment not found']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            if (isset($data['amount'])) {
                $payment->setAmount((float)$data['amount']);
            }
            if (isset($data['payment_method'])) {
                $payment->setPaymentMethod($data['payment_method']);
            }
            if (isset($data['reference'])) {
                $payment->setReference($data['reference']);
            }
            if (isset($data['notes'])) {
                $payment->setNotes($data['notes']);
            }

            $payment->setUpdatedAt(new \DateTime());
            $payment->incrementVersion();

            $this->paymentRepository->save($payment);

            http_response_code(200);
            echo json_encode([
                'id' => $payment->getId(),
                'amount' => $payment->getAmount(),
                'payment_method' => $payment->getPaymentMethod(),
                'reference' => $payment->getReference(),
                'notes' => $payment->getNotes(),
                'updated_at' => $payment->getUpdatedAt()->format('Y-m-d H:i:s')
            ]);
        } catch (\RuntimeException $e) {
            http_response_code(409);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function delete(string $id): void
    {
        try {
            $payment = $this->paymentRepository->findById($id);

            if (!$payment) {
                http_response_code(404);
                echo json_encode(['error' => 'Payment not found']);
                return;
            }

            $this->paymentRepository->delete($id);

            http_response_code(204);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function bySupplier(string $supplierId): void
    {
        try {
            $payments = $this->paymentRepository->findBySupplierId($supplierId);
            $paymentsData = array_map(function ($payment) {
                return [
                    'id' => $payment->getId(),
                    'amount' => $payment->getAmount(),
                    'payment_date' => $payment->getPaymentDate()->format('Y-m-d'),
                    'payment_method' => $payment->getPaymentMethod(),
                    'reference' => $payment->getReference(),
                    'notes' => $payment->getNotes(),
                    'created_at' => $payment->getCreatedAt()->format('Y-m-d H:i:s')
                ];
            }, $payments);

            http_response_code(200);
            echo json_encode($paymentsData);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }
}
