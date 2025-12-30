<?php

declare(strict_types=1);

namespace LedgerFlow\Application\UseCases;

use LedgerFlow\Domain\Entities\Supplier;
use LedgerFlow\Domain\Repositories\SupplierRepositoryInterface;

/**
 * Create Supplier Use Case
 * 
 * Handles supplier creation with proper validation and business rules.
 * Follows Clean Architecture principles - independent of frameworks.
 */
class CreateSupplier
{
    private SupplierRepositoryInterface $supplierRepository;

    public function __construct(SupplierRepositoryInterface $supplierRepository)
    {
        $this->supplierRepository = $supplierRepository;
    }

    /**
     * Execute the use case to create a new supplier
     * 
     * @param array $data Supplier data including name, code, and optional contact details
     * @return Supplier The created supplier entity
     * @throws \InvalidArgumentException If validation fails
     */
    public function execute(array $data): Supplier
    {
        // Validate input
        $this->validate($data);

        // Check if code already exists
        if ($this->supplierRepository->codeExists($data['code'])) {
            throw new \InvalidArgumentException('Supplier code already exists');
        }

        // Create supplier entity with correct parameter order: name, code, phone, email, address, notes
        $supplier = new Supplier(
            $data['name'],
            $data['code'],
            $data['phone'] ?? null,
            $data['email'] ?? null,
            $data['address'] ?? null,
            $data['notes'] ?? null,
            true  // isActive defaults to true for new suppliers
        );

        // Save to repository and return with generated ID
        return $this->supplierRepository->save($supplier);
    }

    /**
     * Validate supplier input data
     * 
     * @param array $data Supplier data to validate
     * @throws \InvalidArgumentException If validation fails
     */
    private function validate(array $data): void
    {
        if (empty($data['name']) || !is_string($data['name'])) {
            throw new \InvalidArgumentException('Supplier name is required and must be a string');
        }

        if (strlen($data['name']) < 2 || strlen($data['name']) > 255) {
            throw new \InvalidArgumentException('Supplier name must be between 2 and 255 characters');
        }

        if (empty($data['code']) || !is_string($data['code'])) {
            throw new \InvalidArgumentException('Supplier code is required and must be a string');
        }

        if (!preg_match('/^[A-Z0-9-]+$/', $data['code'])) {
            throw new \InvalidArgumentException(
                'Supplier code must contain only uppercase letters, numbers, and hyphens'
            );
        }

        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email format');
        }

        if (isset($data['phone']) && !empty($data['phone']) && !is_string($data['phone'])) {
            throw new \InvalidArgumentException('Phone must be a string');
        }
    }
}
