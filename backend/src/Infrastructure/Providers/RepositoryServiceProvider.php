<?php

declare(strict_types=1);

namespace Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;

// Domain Repository Interfaces
use Domain\Repositories\UserRepositoryInterface;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\Repositories\CollectionRepositoryInterface;
use Domain\Repositories\PaymentRepositoryInterface;

// Infrastructure Repository Implementations
use Infrastructure\Repositories\UserRepository;
use Infrastructure\Repositories\SupplierRepository;
use Infrastructure\Repositories\ProductRepository;
use Infrastructure\Repositories\CollectionRepository;
use Infrastructure\Repositories\PaymentRepository;

/**
 * Repository Service Provider
 * 
 * Binds domain repository interfaces to their infrastructure implementations.
 * This enables dependency injection throughout the application while maintaining
 * the dependency inversion principle (DIP) of SOLID.
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register repository bindings
     *
     * @return void
     */
    public function register(): void
    {
        // Bind repository interfaces to concrete implementations
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(SupplierRepositoryInterface::class, SupplierRepository::class);
        $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);
        $this->app->bind(CollectionRepositoryInterface::class, CollectionRepository::class);
        $this->app->bind(PaymentRepositoryInterface::class, PaymentRepository::class);
    }

    /**
     * Bootstrap any application services
     *
     * @return void
     */
    public function boot(): void
    {
        //
    }
}
