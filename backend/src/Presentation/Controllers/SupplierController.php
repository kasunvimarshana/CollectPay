<?php

declare(strict_types=1);

namespace TrackVault\Presentation\Controllers;

use TrackVault\Domain\Repositories\SupplierRepositoryInterface;
use TrackVault\Domain\Entities\Supplier;
use TrackVault\Domain\ValueObjects\SupplierId;
use Exception;

/**
 * Supplier Controller
 * 
 * Handles supplier CRUD operations
 */
final class SupplierController extends BaseController
{
    private SupplierRepositoryInterface $supplierRepository;

    public function __construct(SupplierRepositoryInterface $supplierRepository)
    {
        $this->supplierRepository = $supplierRepository;
    }

    public function index(): void
    {
        try {
            $limit = (int)($_GET['limit'] ?? 100);
            $offset = (int)($_GET['offset'] ?? 0);
            
            $suppliers = $this->supplierRepository->findAll($limit, $offset);
            
            $data = array_map(fn($supplier) => $supplier->toArray(), $suppliers);
            
            $this->successResponse($data);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'FETCH_FAILED', 500);
        }
    }

    public function show(string $id): void
    {
        try {
            $supplier = $this->supplierRepository->findById(new SupplierId($id));
            
            if (!$supplier) {
                $this->errorResponse('Supplier not found', 'NOT_FOUND', 404);
                return;
            }
            
            $this->successResponse($supplier->toArray());
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'FETCH_FAILED', 500);
        }
    }

    public function store(): void
    {
        try {
            $data = $this->getRequestBody();
            
            // Validation
            $required = ['name', 'contact_person', 'phone', 'email', 'address'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    $this->errorResponse("Field '{$field}' is required", 'VALIDATION_ERROR', 400);
                    return;
                }
            }

            $supplier = new Supplier(
                SupplierId::generate(),
                $data['name'],
                $data['contact_person'],
                $data['phone'],
                $data['email'],
                $data['address'],
                $data['bank_account'] ?? null,
                $data['tax_id'] ?? null,
                $data['metadata'] ?? []
            );

            $this->supplierRepository->save($supplier);
            
            $this->successResponse($supplier->toArray(), 'Supplier created successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'CREATE_FAILED', 400);
        }
    }

    public function update(string $id): void
    {
        try {
            $supplier = $this->supplierRepository->findById(new SupplierId($id));
            
            if (!$supplier) {
                $this->errorResponse('Supplier not found', 'NOT_FOUND', 404);
                return;
            }

            $data = $this->getRequestBody();
            
            // Update supplier with new data
            $updatedSupplier = new Supplier(
                $supplier->getId(),
                $data['name'] ?? $supplier->getName(),
                $data['contact_person'] ?? $supplier->getContactPerson(),
                $data['phone'] ?? $supplier->getPhone(),
                $data['email'] ?? $supplier->getEmail(),
                $data['address'] ?? $supplier->getAddress(),
                $data['bank_account'] ?? $supplier->getBankAccount(),
                $data['tax_id'] ?? $supplier->getTaxId(),
                $data['metadata'] ?? $supplier->getMetadata(),
                $supplier->getCreatedAt(),
                new \DateTimeImmutable(),
                null,
                $supplier->getVersion() + 1
            );

            $this->supplierRepository->save($updatedSupplier);
            
            $this->successResponse($updatedSupplier->toArray(), 'Supplier updated successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'UPDATE_FAILED', 400);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $supplier = $this->supplierRepository->findById(new SupplierId($id));
            
            if (!$supplier) {
                $this->errorResponse('Supplier not found', 'NOT_FOUND', 404);
                return;
            }

            $this->supplierRepository->delete(new SupplierId($id));
            
            $this->successResponse(null, 'Supplier deleted successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'DELETE_FAILED', 400);
        }
    }
}
