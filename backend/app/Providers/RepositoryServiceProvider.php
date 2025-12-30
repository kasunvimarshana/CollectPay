<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\Repositories\RateRepositoryInterface;
use Domain\Repositories\UserRepositoryInterface;
use Domain\Repositories\CollectionRepositoryInterface;
use Domain\Repositories\PaymentRepositoryInterface;
use Domain\Services\UuidGeneratorInterface;
use Infrastructure\Persistence\Repositories\EloquentSupplierRepository;
use Infrastructure\Persistence\Repositories\EloquentProductRepository;
use Infrastructure\Persistence\Repositories\EloquentRateRepository;
use Infrastructure\Persistence\Repositories\EloquentUserRepository;
use Infrastructure\Persistence\Repositories\EloquentCollectionRepository;
use Infrastructure\Persistence\Repositories\EloquentPaymentRepository;
use Infrastructure\Services\LaravelUuidGenerator;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind UUID Generator Interface
        $this->app->singleton(
            UuidGeneratorInterface::class,
            LaravelUuidGenerator::class
        );

        // Bind Repository Interfaces to Eloquent Implementations
        $this->app->bind(
            SupplierRepositoryInterface::class,
            EloquentSupplierRepository::class
        );

        $this->app->bind(
            ProductRepositoryInterface::class,
            EloquentProductRepository::class
        );

        $this->app->bind(
            RateRepositoryInterface::class,
            EloquentRateRepository::class
        );

        $this->app->bind(
            UserRepositoryInterface::class,
            EloquentUserRepository::class
        );

        $this->app->bind(
            CollectionRepositoryInterface::class,
            EloquentCollectionRepository::class
        );

        $this->app->bind(
            PaymentRepositoryInterface::class,
            EloquentPaymentRepository::class
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
