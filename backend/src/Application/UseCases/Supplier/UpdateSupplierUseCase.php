<?php

declare(strict_types=1);

namespace Application\UseCases\Supplier;

use Application\DTOs\UpdateSupplierDTO;
use Domain\Entities\Supplier;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\ValueObjects\UUID;
use InvalidArgumentException;

/**
 * Update Supplier Use Case
 * 
 * Application service for updating suppliers
 */
final class UpdateSupplierUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $repository
    ) {
    }

    public function execute(UpdateSupplierDTO $dto): Supplier
    {
        $id = UUID::fromString($dto->id);
        
        $supplier = $this->repository->findById($id);
        if (!$supplier) {
            throw new InvalidArgumentException("Supplier not found with ID: {$dto->id}");
        }

        $updatedSupplier = $supplier->update(
            $dto->name,
            $dto->email,
            $dto->phone,
            $dto->address
        );

        $this->repository->save($updatedSupplier);

        return $updatedSupplier;
    }
}
