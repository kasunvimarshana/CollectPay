<?php

declare(strict_types=1);

namespace TrackVault\Application\UseCases;

use TrackVault\Domain\Entities\Supplier;
use TrackVault\Domain\Repositories\SupplierRepositoryInterface;
use TrackVault\Domain\ValueObjects\SupplierId;
use TrackVault\Infrastructure\Logging\AuditLogger;

/**
 * Create Supplier Use Case
 */
final class CreateSupplierUseCase
{
    private SupplierRepositoryInterface $supplierRepository;
    private AuditLogger $auditLogger;

    public function __construct(
        SupplierRepositoryInterface $supplierRepository,
        AuditLogger $auditLogger
    ) {
        $this->supplierRepository = $supplierRepository;
        $this->auditLogger = $auditLogger;
    }

    public function execute(array $data, string $createdBy): Supplier
    {
        // Validate required fields
        $required = ['name', 'contact_person', 'phone', 'email', 'address'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new \InvalidArgumentException("Field '{$field}' is required");
            }
        }

        // Create supplier
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

        // Save supplier
        $this->supplierRepository->save($supplier);

        // Log audit trail
        $this->auditLogger->logCreate($createdBy, 'Supplier', $supplier->getId()->toString(), $supplier->toArray());

        return $supplier;
    }
}
