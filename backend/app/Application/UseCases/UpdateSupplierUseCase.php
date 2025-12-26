<?php

namespace App\Application\UseCases;

use App\Application\DTOs\UpdateSupplierDTO;
use App\Domain\Entities\SupplierEntity;
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;

/**
 * Update Supplier Use Case
 * 
 * Application service that orchestrates supplier updates with version control.
 */
class UpdateSupplierUseCase
{
    private SupplierRepositoryInterface $supplierRepository;

    public function __construct(SupplierRepositoryInterface $supplierRepository)
    {
        $this->supplierRepository = $supplierRepository;
    }

    /**
     * Execute the use case
     * 
     * @param UpdateSupplierDTO $dto
     * @return SupplierEntity
     * @throws \InvalidArgumentException
     * @throws EntityNotFoundException
     * @throws VersionConflictException
     */
    public function execute(UpdateSupplierDTO $dto): SupplierEntity
    {
        // Find existing supplier
        $supplier = $this->supplierRepository->findById($dto->id);
        
        if (!$supplier) {
            throw EntityNotFoundException::forEntity('Supplier', $dto->id);
        }

        // Check version for optimistic locking
        if ($supplier->getVersion() !== $dto->version) {
            throw VersionConflictException::forEntity(
                'Supplier',
                $supplier->getVersion(),
                $dto->version
            );
        }

        // Check if code is being changed and if it's unique
        if ($dto->code !== null && $dto->code !== $supplier->getCode()) {
            if ($this->supplierRepository->codeExists($dto->code, $dto->id)) {
                throw new \InvalidArgumentException("Supplier code '{$dto->code}' already exists");
            }
        }

        // Update supplier details
        $supplier->updateDetails(
            name: $dto->name,
            address: $dto->address,
            phone: $dto->phone,
            email: $dto->email,
            metadata: $dto->metadata
        );

        // Update active status if provided
        if ($dto->isActive !== null) {
            $dto->isActive ? $supplier->activate() : $supplier->deactivate();
        }

        // Increment version for optimistic locking
        $supplier->incrementVersion();

        // Persist changes
        return $this->supplierRepository->save($supplier);
    }
}
