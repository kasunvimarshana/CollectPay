<?php

namespace App\Domain\Events;

/**
 * Domain Event Interface
 * 
 * Marker interface for all domain events.
 * Domain events represent something that happened in the domain
 * and are used for decoupled communication between aggregates.
 */
interface DomainEventInterface
{
    /**
     * Get event timestamp
     *
     * @return \DateTimeImmutable
     */
    public function occurredOn(): \DateTimeImmutable;

    /**
     * Convert event to array
     *
     * @return array
     */
    public function toArray(): array;
}
