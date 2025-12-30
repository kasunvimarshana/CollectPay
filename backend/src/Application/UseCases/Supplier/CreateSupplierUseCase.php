<?php

declare(strict_types=1);

namespace Application\UseCases\Supplier;

use Domain\Entities\Supplier;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\Services\UuidGeneratorInterface;
use Application\DTOs\CreateSupplierDTO;

/**
 * Create Supplier Use Case
 * Handles the business logic for creating a new supplier
 */
final class CreateSupplierUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $supplierRepository,
        private readonly UuidGeneratorInterface $uuidGenerator
    ) {}

    public function execute(CreateSupplierDTO $dto): Supplier
    {
        // Check if supplier code already exists
        $existingSupplier = $this->supplierRepository->findByCode($dto->code);
        if ($existingSupplier) {
            throw new \DomainException("Supplier with code '{$dto->code}' already exists");
        }

        // Generate UUID for new supplier
        $id = $this->uuidGenerator->generate();

        // Create new supplier entity
        $supplier = Supplier::create(
            $id,
            $dto->name,
            $dto->code,
            $dto->address,
            $dto->phone,
            $dto->email
        );

        // Persist to repository
        $this->supplierRepository->save($supplier);

        return $supplier;
    }
}
