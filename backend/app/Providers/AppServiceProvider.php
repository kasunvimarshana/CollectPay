<?php

namespace App\Providers;

use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\PaymentRepositoryInterface;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Domain\Services\AuditServiceInterface;
use App\Infrastructure\Persistence\EloquentCollectionRepository;
use App\Infrastructure\Persistence\EloquentPaymentRepository;
use App\Infrastructure\Persistence\EloquentProductRateRepository;
use App\Infrastructure\Persistence\EloquentProductRepository;
use App\Infrastructure\Persistence\EloquentSupplierRepository;
use App\Infrastructure\Services\EloquentAuditService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register repository implementations
        // This binds interfaces to concrete implementations (Dependency Inversion Principle)

        // Core entities
        $this->app->bind(SupplierRepositoryInterface::class, EloquentSupplierRepository::class);
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
        $this->app->bind(ProductRateRepositoryInterface::class, EloquentProductRateRepository::class);
        $this->app->bind(CollectionRepositoryInterface::class, EloquentCollectionRepository::class);
        $this->app->bind(PaymentRepositoryInterface::class, EloquentPaymentRepository::class);

        // Register service implementations
        $this->app->bind(AuditServiceInterface::class, EloquentAuditService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
