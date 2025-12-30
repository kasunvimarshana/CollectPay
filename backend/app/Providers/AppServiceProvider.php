<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register Repository Bindings
        $this->app->bind(
            \App\Domain\Repositories\SupplierRepositoryInterface::class,
            \App\Infrastructure\Repositories\SupplierRepository::class
        );

        $this->app->bind(
            \App\Domain\Repositories\ProductRepositoryInterface::class,
            \App\Infrastructure\Repositories\ProductRepository::class
        );

        $this->app->bind(
            \App\Domain\Repositories\CollectionRepositoryInterface::class,
            \App\Infrastructure\Repositories\CollectionRepository::class
        );

        $this->app->bind(
            \App\Domain\Repositories\PaymentRepositoryInterface::class,
            \App\Infrastructure\Repositories\PaymentRepository::class
        );

        $this->app->bind(
            \App\Domain\Repositories\UserRepositoryInterface::class,
            \App\Infrastructure\Repositories\UserRepository::class
        );

        $this->app->bind(
            \App\Domain\Repositories\ProductRateRepositoryInterface::class,
            \App\Infrastructure\Repositories\ProductRateRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
