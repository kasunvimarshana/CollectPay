<?php

namespace App\Presentation\Controllers;

use App\Infrastructure\Repositories\MySQLSupplierRepository;
use App\Infrastructure\Security\AuthService;
use App\Domain\Entities\Supplier;

/**
 * Supplier Controller
 * Handles supplier CRUD operations
 */
class SupplierController extends BaseController
{
    private MySQLSupplierRepository $supplierRepository;
    
    public function __construct()
    {
        $this->supplierRepository = new MySQLSupplierRepository();
    }
    
    /**
     * Get all suppliers
     */
    public function index(): void
    {
        $this->requireAuth();
        
        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 20;
        $isActive = isset($_GET['is_active']) ? (bool) $_GET['is_active'] : null;
        $region = $_GET['region'] ?? null;
        
        $filters = [];
        if ($isActive !== null) {
            $filters['is_active'] = $isActive ? 1 : 0;
        }
        if ($region) {
            $filters['region'] = $region;
        }
        
        $suppliers = $this->supplierRepository->findAll($filters, (int) $page, (int) $perPage);
        
        $this->successResponse(array_map(fn($s) => $s->toArray(), $suppliers));
    }
    
    /**
     * Get supplier by ID
     */
    public function show(int $id): void
    {
        $this->requireAuth();
        
        $supplier = $this->supplierRepository->findById($id);
        
        if (!$supplier) {
            $this->errorResponse('Supplier not found', 404);
        }
        
        $this->successResponse($supplier->toArray());
    }
    
    /**
     * Create new supplier
     */
    public function store(): void
    {
        $this->requireAuth();
        
        $data = $this->getJsonBody();
        
        $errors = $this->validateRequired($data, ['name', 'code']);
        if (!empty($errors)) {
            $this->errorResponse('Validation failed', 422, $errors);
        }
        
        // Check if code already exists
        if ($this->supplierRepository->codeExists($data['code'])) {
            $this->errorResponse('Supplier code already exists', 409);
        }
        
        $supplier = new Supplier(
            $data['name'],
            $data['code'],
            $data['phone'] ?? null,
            $data['address'] ?? null,
            $data['region'] ?? null,
            $data['notes'] ?? null
        );
        
        $savedSupplier = $this->supplierRepository->save($supplier);
        
        $this->successResponse($savedSupplier->toArray(), 'Supplier created successfully', 201);
    }
    
    /**
     * Update supplier
     */
    public function update(int $id): void
    {
        $this->requireAuth();
        
        $supplier = $this->supplierRepository->findById($id);
        
        if (!$supplier) {
            $this->errorResponse('Supplier not found', 404);
        }
        
        $data = $this->getJsonBody();
        
        // Update supplier
        $supplier->update(
            $data['name'] ?? $supplier->getName(),
            $data['phone'] ?? $supplier->getPhone(),
            $data['address'] ?? $supplier->getAddress(),
            $data['region'] ?? $supplier->getRegion(),
            $data['notes'] ?? $supplier->getNotes()
        );
        
        $updatedSupplier = $this->supplierRepository->update($supplier);
        
        $this->successResponse($updatedSupplier->toArray(), 'Supplier updated successfully');
    }
    
    /**
     * Delete supplier
     */
    public function delete(int $id): void
    {
        $this->requireAuth();
        
        $supplier = $this->supplierRepository->findById($id);
        
        if (!$supplier) {
            $this->errorResponse('Supplier not found', 404);
        }
        
        $this->supplierRepository->delete($id);
        
        $this->successResponse(null, 'Supplier deleted successfully');
    }
    
    /**
     * Require authentication
     */
    private function requireAuth(): void
    {
        $token = $this->getAuthToken();
        
        if (!$token || !AuthService::verifyToken($token)) {
            $this->errorResponse('Unauthorized', 401);
        }
    }
}
