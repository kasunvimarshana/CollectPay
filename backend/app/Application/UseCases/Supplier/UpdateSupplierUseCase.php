<?php

namespace App\Application\UseCases\Supplier;

use App\Application\DTOs\SupplierDTO;
use App\Domain\Entities\SupplierEntity;
use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * Update Supplier Use Case
 *
 * Handles the business logic for updating an existing supplier.
 */
class UpdateSupplierUseCase
{
    private SupplierRepositoryInterface $repository;

    public function __construct(SupplierRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Execute the use case
     *
     * @throws \InvalidArgumentException
     * @throws \RuntimeException
     */
    public function execute(int $id, SupplierDTO $dto): SupplierEntity
    {
        // Find existing supplier
        $supplier = $this->repository->findById($id);

        if ($supplier === null) {
            throw new \InvalidArgumentException("Supplier with ID {$id} not found");
        }

        // Check code uniqueness if code is being changed
        if ($supplier->getCode() !== $dto->code) {
            if (! $this->repository->isCodeUnique($dto->code, $id)) {
                throw new \InvalidArgumentException("Supplier code '{$dto->code}' already exists");
            }
        }

        // Check version for optimistic locking (prevents concurrent update conflicts)
        if ($supplier->getVersion() !== $dto->version) {
            throw new \RuntimeException('Supplier has been modified by another user. Please refresh and try again.');
        }

        // Create updated entity
        $updatedSupplier = new SupplierEntity(
            name: $dto->name,
            code: $dto->code,
            contactPerson: $dto->contactPerson,
            phone: $dto->phone,
            email: $dto->email,
            address: $dto->address,
            city: $dto->city,
            state: $dto->state,
            country: $dto->country,
            postalCode: $dto->postalCode,
            status: $dto->status,
            version: $supplier->getVersion() + 1,
            id: $id,
            createdAt: $supplier->getCreatedAt(),
            updatedAt: new \DateTime()
        );

        // Persist the updated entity
        try {
            return $this->repository->save($updatedSupplier);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to update supplier: '.$e->getMessage(), 0, $e);
        }
    }
}
