<?php

namespace App\Infrastructure\Events;

use App\Domain\Events\EventDispatcherInterface;
use App\Domain\Events\DomainEventInterface;
use Illuminate\Support\Facades\Event;

/**
 * Laravel Event Dispatcher Adapter
 * 
 * Adapts Laravel's event system to the domain event dispatcher interface.
 * Allows domain events to be dispatched through Laravel's event system.
 */
class LaravelEventDispatcher implements EventDispatcherInterface
{
    /**
     * Dispatch a domain event
     *
     * @param DomainEventInterface $event
     * @return void
     */
    public function dispatch(DomainEventInterface $event): void
    {
        Event::dispatch($event);
    }

    /**
     * Register an event listener
     *
     * @param string $eventClass
     * @param callable $listener
     * @return void
     */
    public function listen(string $eventClass, callable $listener): void
    {
        Event::listen($eventClass, $listener);
    }
}
