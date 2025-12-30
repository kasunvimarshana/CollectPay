<?php

declare(strict_types=1);

namespace Application\UseCases\Supplier;

use Application\DTOs\UpdateSupplierDTO;
use Domain\Entities\Supplier;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\ValueObjects\Email;
use Domain\ValueObjects\PhoneNumber;

/**
 * Use Case: Update an existing supplier
 */
final class UpdateSupplierUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $supplierRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $supplierId
     * @param UpdateSupplierDTO $dto
     * @return Supplier
     * @throws \InvalidArgumentException
     */
    public function execute(string $supplierId, UpdateSupplierDTO $dto): Supplier
    {
        // Find existing supplier
        $supplier = $this->supplierRepository->findById($supplierId);
        
        if (!$supplier) {
            throw new \InvalidArgumentException("Supplier with ID {$supplierId} not found");
        }

        // Update name if provided
        if ($dto->name !== null) {
            $supplier->updateName($dto->name);
        }

        // Update email if provided
        if ($dto->email !== null) {
            $email = new Email($dto->email);
            $supplier->updateEmail($email);
        }

        // Update phone if provided
        if ($dto->phone !== null) {
            $phone = new PhoneNumber($dto->phone);
            $supplier->updatePhone($phone);
        }

        // Update address if provided
        if ($dto->address !== null) {
            $supplier->updateAddress($dto->address);
        }

        // Update metadata if provided
        if ($dto->metadata !== null) {
            $supplier->updateMetadata($dto->metadata);
        }

        // Update active status if provided
        if ($dto->isActive !== null) {
            if ($dto->isActive) {
                $supplier->activate();
            } else {
                $supplier->deactivate();
            }
        }

        // Persist changes
        return $this->supplierRepository->save($supplier);
    }
}
