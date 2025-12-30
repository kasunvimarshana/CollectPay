<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Domain\Repositories\SupplierRepositoryInterface;
use Infrastructure\Persistence\Repositories\EloquentSupplierRepository;

/**
 * Domain Service Provider
 * 
 * Binds domain interfaces to infrastructure implementations
 * Following Dependency Inversion Principle
 */
class DomainServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind Repository Interfaces to Eloquent Implementations
        $this->app->bind(
            SupplierRepositoryInterface::class,
            EloquentSupplierRepository::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
