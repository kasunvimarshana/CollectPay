<?php

namespace App\Domain\Events;

/**
 * Event Dispatcher Interface
 * 
 * Contract for dispatching domain events.
 * Allows domain layer to remain framework-independent.
 */
interface EventDispatcherInterface
{
    /**
     * Dispatch a domain event
     *
     * @param DomainEventInterface $event
     * @return void
     */
    public function dispatch(DomainEventInterface $event): void;

    /**
     * Register an event listener
     *
     * @param string $eventClass
     * @param callable $listener
     * @return void
     */
    public function listen(string $eventClass, callable $listener): void;
}
