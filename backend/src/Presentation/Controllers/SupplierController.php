<?php

declare(strict_types=1);

namespace LedgerFlow\Presentation\Controllers;

use LedgerFlow\Application\UseCases\CreateSupplier;
use LedgerFlow\Domain\Repositories\SupplierRepositoryInterface;
use LedgerFlow\Application\Services\BalanceCalculationService;
use LedgerFlow\Domain\Entities\Supplier;

/**
 * Supplier Controller
 * 
 * Handles HTTP requests for supplier-related operations.
 * Follows Clean Architecture - thin controller delegating to use cases.
 */
class SupplierController extends BaseController
{
    private SupplierRepositoryInterface $supplierRepository;
    private CreateSupplier $createSupplier;
    private BalanceCalculationService $balanceService;

    public function __construct(
        SupplierRepositoryInterface $supplierRepository,
        CreateSupplier $createSupplier,
        BalanceCalculationService $balanceService
    ) {
        $this->supplierRepository = $supplierRepository;
        $this->createSupplier = $createSupplier;
        $this->balanceService = $balanceService;
    }

    /**
     * List all suppliers
     */
    public function index(): void
    {
        try {
            $suppliers = $this->supplierRepository->findAll();
            $this->sendSuccessResponse(
                array_map(fn(Supplier $supplier) => $supplier->toArray(), $suppliers)
            );
        } catch (\Exception $e) {
            $this->handleException($e);
        }
    }

    /**
     * Get a specific supplier by ID with balance
     */
    public function show(string $id): void
    {
        try {
            $supplierId = $this->parseId($id);
            $supplier = $this->supplierRepository->findById($supplierId);

            if (!$supplier) {
                $this->sendNotFoundResponse('Supplier not found');
                return;
            }

            $balance = $this->balanceService->calculateSupplierBalance($supplierId);
            
            $supplierData = $supplier->toArray();
            $supplierData['balance'] = $balance;

            $this->sendSuccessResponse($supplierData);
        } catch (\Exception $e) {
            $this->handleException($e);
        }
    }

    /**
     * Create a new supplier
     */
    public function store(): void
    {
        try {
            $data = $this->getJsonInput();
            $supplier = $this->createSupplier->execute($data);
            $this->sendCreatedResponse($supplier->toArray(), 'Supplier created successfully');
        } catch (\Exception $e) {
            $this->handleException($e);
        }
    }

    /**
     * Update an existing supplier
     */
    public function update(string $id): void
    {
        try {
            $supplierId = $this->parseId($id);
            $supplier = $this->supplierRepository->findById($supplierId);

            if (!$supplier) {
                $this->sendNotFoundResponse('Supplier not found');
                return;
            }

            $data = $this->getJsonInput();

            // Update supplier profile using domain method
            $supplier->updateProfile(
                $data['name'] ?? $supplier->getName(),
                $data['phone'] ?? $supplier->getPhone(),
                $data['email'] ?? $supplier->getEmail(),
                $data['address'] ?? $supplier->getAddress(),
                $data['notes'] ?? $supplier->getNotes()
            );

            // Handle activation/deactivation
            if (isset($data['is_active'])) {
                if ($data['is_active']) {
                    $supplier->activate();
                } else {
                    $supplier->deactivate();
                }
            }

            $this->supplierRepository->save($supplier);
            $this->sendSuccessResponse($supplier->toArray(), 'Supplier updated successfully');
        } catch (\Exception $e) {
            $this->handleException($e);
        }
    }

    /**
     * Delete a supplier (soft delete)
     */
    public function delete(string $id): void
    {
        try {
            $supplierId = $this->parseId($id);
            $supplier = $this->supplierRepository->findById($supplierId);

            if (!$supplier) {
                $this->sendNotFoundResponse('Supplier not found');
                return;
            }

            $supplier->delete();
            $this->supplierRepository->save($supplier);
            
            $this->sendSuccessResponse(null, 'Supplier deleted successfully');
        } catch (\Exception $e) {
            $this->handleException($e);
        }
    }
}
