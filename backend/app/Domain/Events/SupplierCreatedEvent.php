<?php

namespace App\Domain\Events;

use App\Domain\Entities\SupplierEntity;

/**
 * Supplier Created Event
 * 
 * Fired when a new supplier is created in the domain.
 * Can be used by other parts of the system to react to supplier creation.
 */
class SupplierCreatedEvent extends AbstractDomainEvent
{
    private SupplierEntity $supplier;

    public function __construct(SupplierEntity $supplier)
    {
        parent::__construct();
        $this->supplier = $supplier;
    }

    public function getSupplier(): SupplierEntity
    {
        return $this->supplier;
    }

    public function toArray(): array
    {
        return [
            'event' => 'supplier.created',
            'occurred_on' => $this->occurredOn()->format('Y-m-d H:i:s'),
            'supplier_id' => $this->supplier->getId(),
            'supplier_code' => $this->supplier->getCode(),
            'supplier_name' => $this->supplier->getName(),
        ];
    }
}
