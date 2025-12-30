<?php

declare(strict_types=1);

namespace Application\UseCases\Supplier;

use Application\DTOs\CreateSupplierDTO;
use Domain\Entities\Supplier;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\ValueObjects\Email;
use Domain\ValueObjects\PhoneNumber;

/**
 * Use Case: Create a new supplier
 */
final class CreateSupplierUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $supplierRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param CreateSupplierDTO $dto
     * @return Supplier
     */
    public function execute(CreateSupplierDTO $dto): Supplier
    {
        // Validate email if provided
        $email = $dto->email ? new Email($dto->email) : null;
        
        // Validate phone if provided
        $phone = $dto->phone ? new PhoneNumber($dto->phone) : null;

        // Generate UUID for supplier
        $id = \Illuminate\Support\Str::uuid()->toString();

        // Create supplier entity
        $supplier = Supplier::create(
            id: $id,
            name: $dto->name,
            email: $email,
            phone: $phone,
            address: $dto->address,
            metadata: $dto->metadata
        );

        // Persist supplier
        return $this->supplierRepository->save($supplier);
    }
}
