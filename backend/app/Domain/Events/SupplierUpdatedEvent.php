<?php

namespace App\Domain\Events;

use App\Domain\Entities\SupplierEntity;

/**
 * Supplier Updated Event
 * 
 * Fired when a supplier is updated in the domain.
 */
class SupplierUpdatedEvent extends AbstractDomainEvent
{
    private SupplierEntity $supplier;
    private array $changes;

    public function __construct(SupplierEntity $supplier, array $changes = [])
    {
        parent::__construct();
        $this->supplier = $supplier;
        $this->changes = $changes;
    }

    public function getSupplier(): SupplierEntity
    {
        return $this->supplier;
    }

    public function getChanges(): array
    {
        return $this->changes;
    }

    public function toArray(): array
    {
        return [
            'event' => 'supplier.updated',
            'occurred_on' => $this->occurredOn()->format('Y-m-d H:i:s'),
            'supplier_id' => $this->supplier->getId(),
            'supplier_code' => $this->supplier->getCode(),
            'changes' => $this->changes,
        ];
    }
}
