<?php

namespace App\Domain\Events;

/**
 * Abstract Domain Event
 * 
 * Base class for all domain events providing common functionality.
 */
abstract class AbstractDomainEvent implements DomainEventInterface
{
    private \DateTimeImmutable $occurredOn;

    public function __construct()
    {
        $this->occurredOn = new \DateTimeImmutable();
    }

    /**
     * Get event timestamp
     *
     * @return \DateTimeImmutable
     */
    public function occurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }

    /**
     * Convert event to array
     *
     * @return array
     */
    abstract public function toArray(): array;
}
