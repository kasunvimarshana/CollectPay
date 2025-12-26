<?php

namespace App\Application\UseCases;

use App\Domain\Entities\SupplierEntity;
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;

/**
 * Get Supplier Use Case
 * 
 * Application service for retrieving a supplier by ID.
 */
class GetSupplierUseCase
{
    private SupplierRepositoryInterface $supplierRepository;

    public function __construct(SupplierRepositoryInterface $supplierRepository)
    {
        $this->supplierRepository = $supplierRepository;
    }

    /**
     * Execute the use case
     * 
     * @param int $id
     * @return SupplierEntity
     * @throws EntityNotFoundException
     */
    public function execute(int $id): SupplierEntity
    {
        $supplier = $this->supplierRepository->findById($id);
        
        if (!$supplier) {
            throw EntityNotFoundException::forEntity('Supplier', $id);
        }

        return $supplier;
    }
}
