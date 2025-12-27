<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

// Repository Interfaces
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\PaymentRepositoryInterface;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Repositories\UserRepositoryInterface;

// Repository Implementations
use App\Infrastructure\Repositories\EloquentSupplierRepository;
use App\Infrastructure\Repositories\EloquentCollectionRepository;
use App\Infrastructure\Repositories\EloquentPaymentRepository;
use App\Infrastructure\Repositories\EloquentProductRepository;
use App\Infrastructure\Repositories\EloquentProductRateRepository;
use App\Infrastructure\Repositories\EloquentUserRepository;

// Use Cases
use App\Application\UseCases\CreateSupplierUseCase;
use App\Application\UseCases\UpdateSupplierUseCase;
use App\Application\UseCases\GetSupplierUseCase;
use App\Application\UseCases\CreateCollectionUseCase;
use App\Application\UseCases\UpdateCollectionUseCase;
use App\Application\UseCases\GetCollectionUseCase;
use App\Application\UseCases\DeleteCollectionUseCase;
use App\Application\UseCases\CreatePaymentUseCase;
use App\Application\UseCases\UpdatePaymentUseCase;
use App\Application\UseCases\GetPaymentUseCase;
use App\Application\UseCases\DeletePaymentUseCase;
use App\Application\UseCases\CreateProductUseCase;
use App\Application\UseCases\UpdateProductUseCase;
use App\Application\UseCases\GetProductUseCase;
use App\Application\UseCases\DeleteProductUseCase;
use App\Application\UseCases\CreateProductRateUseCase;
use App\Application\UseCases\UpdateProductRateUseCase;
use App\Application\UseCases\GetProductRateUseCase;
use App\Application\UseCases\DeleteProductRateUseCase;
use App\Application\UseCases\RegisterUserUseCase;
use App\Application\UseCases\LoginUserUseCase;
use App\Application\UseCases\BatchSyncUseCase;

// Domain Services
use App\Domain\Services\SupplierBalanceService;
use App\Domain\Services\CollectionRateService;

// Domain Events
use App\Domain\Events\EventDispatcherInterface;
use App\Infrastructure\Events\LaravelEventDispatcher;

/**
 * Domain Service Provider
 * 
 * Registers domain services and binds repository interfaces to implementations.
 * Follows Dependency Inversion Principle.
 */
class DomainServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind repository interfaces to implementations
        $this->registerRepositories();
        
        // Register domain services as singletons
        $this->registerDomainServices();
        
        // Register use cases
        $this->registerUseCases();
    }

    /**
     * Register repository bindings
     */
    private function registerRepositories(): void
    {
        $this->app->bind(SupplierRepositoryInterface::class, EloquentSupplierRepository::class);
        $this->app->bind(CollectionRepositoryInterface::class, EloquentCollectionRepository::class);
        $this->app->bind(PaymentRepositoryInterface::class, EloquentPaymentRepository::class);
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
        $this->app->bind(ProductRateRepositoryInterface::class, EloquentProductRateRepository::class);
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
    }

    /**
     * Register domain services
     */
    private function registerDomainServices(): void
    {
        $this->app->singleton(SupplierBalanceService::class);
        $this->app->singleton(CollectionRateService::class);
        
        // Bind event dispatcher interface to Laravel implementation
        $this->app->singleton(EventDispatcherInterface::class, LaravelEventDispatcher::class);
    }

    /**
     * Register use cases
     */
    private function registerUseCases(): void
    {
        // Supplier Use Cases
        $this->app->bind(CreateSupplierUseCase::class, function ($app) {
            return new CreateSupplierUseCase(
                $app->make(SupplierRepositoryInterface::class)
            );
        });

        $this->app->bind(UpdateSupplierUseCase::class, function ($app) {
            return new UpdateSupplierUseCase(
                $app->make(SupplierRepositoryInterface::class)
            );
        });

        $this->app->bind(GetSupplierUseCase::class, function ($app) {
            return new GetSupplierUseCase(
                $app->make(SupplierRepositoryInterface::class)
            );
        });

        // Collection Use Cases
        $this->app->bind(CreateCollectionUseCase::class, function ($app) {
            return new CreateCollectionUseCase(
                $app->make(CollectionRepositoryInterface::class),
                $app->make(ProductRateRepositoryInterface::class)
            );
        });

        $this->app->bind(UpdateCollectionUseCase::class, function ($app) {
            return new UpdateCollectionUseCase(
                $app->make(CollectionRepositoryInterface::class),
                $app->make(ProductRateRepositoryInterface::class)
            );
        });

        $this->app->bind(GetCollectionUseCase::class, function ($app) {
            return new GetCollectionUseCase(
                $app->make(CollectionRepositoryInterface::class)
            );
        });

        $this->app->bind(DeleteCollectionUseCase::class, function ($app) {
            return new DeleteCollectionUseCase(
                $app->make(CollectionRepositoryInterface::class)
            );
        });

        // Payment Use Cases
        $this->app->bind(CreatePaymentUseCase::class, function ($app) {
            return new CreatePaymentUseCase(
                $app->make(PaymentRepositoryInterface::class)
            );
        });

        $this->app->bind(UpdatePaymentUseCase::class, function ($app) {
            return new UpdatePaymentUseCase(
                $app->make(PaymentRepositoryInterface::class)
            );
        });

        $this->app->bind(GetPaymentUseCase::class, function ($app) {
            return new GetPaymentUseCase(
                $app->make(PaymentRepositoryInterface::class)
            );
        });

        $this->app->bind(DeletePaymentUseCase::class, function ($app) {
            return new DeletePaymentUseCase(
                $app->make(PaymentRepositoryInterface::class)
            );
        });

        // Product Use Cases
        $this->app->bind(CreateProductUseCase::class, function ($app) {
            return new CreateProductUseCase(
                $app->make(ProductRepositoryInterface::class)
            );
        });

        $this->app->bind(UpdateProductUseCase::class, function ($app) {
            return new UpdateProductUseCase(
                $app->make(ProductRepositoryInterface::class)
            );
        });

        $this->app->bind(GetProductUseCase::class, function ($app) {
            return new GetProductUseCase(
                $app->make(ProductRepositoryInterface::class)
            );
        });

        $this->app->bind(DeleteProductUseCase::class, function ($app) {
            return new DeleteProductUseCase(
                $app->make(ProductRepositoryInterface::class)
            );
        });

        // ProductRate Use Cases
        $this->app->bind(CreateProductRateUseCase::class, function ($app) {
            return new CreateProductRateUseCase(
                $app->make(ProductRateRepositoryInterface::class)
            );
        });

        $this->app->bind(UpdateProductRateUseCase::class, function ($app) {
            return new UpdateProductRateUseCase(
                $app->make(ProductRateRepositoryInterface::class)
            );
        });

        $this->app->bind(GetProductRateUseCase::class, function ($app) {
            return new GetProductRateUseCase(
                $app->make(ProductRateRepositoryInterface::class)
            );
        });

        $this->app->bind(DeleteProductRateUseCase::class, function ($app) {
            return new DeleteProductRateUseCase(
                $app->make(ProductRateRepositoryInterface::class)
            );
        });

        // User Use Cases
        $this->app->bind(RegisterUserUseCase::class, function ($app) {
            return new RegisterUserUseCase(
                $app->make(UserRepositoryInterface::class)
            );
        });

        $this->app->bind(LoginUserUseCase::class, function ($app) {
            return new LoginUserUseCase(
                $app->make(UserRepositoryInterface::class)
            );
        });

        // Sync Use Cases
        $this->app->bind(BatchSyncUseCase::class, function ($app) {
            return new BatchSyncUseCase(
                $app->make(CreateSupplierUseCase::class),
                $app->make(UpdateSupplierUseCase::class),
                $app->make(CreateProductUseCase::class),
                $app->make(UpdateProductUseCase::class),
                $app->make(CreateProductRateUseCase::class),
                $app->make(UpdateProductRateUseCase::class),
                $app->make(CreateCollectionUseCase::class),
                $app->make(UpdateCollectionUseCase::class),
                $app->make(DeleteCollectionUseCase::class),
                $app->make(CreatePaymentUseCase::class),
                $app->make(UpdatePaymentUseCase::class),
                $app->make(DeletePaymentUseCase::class),
                $app->make(SupplierRepositoryInterface::class),
                $app->make(ProductRepositoryInterface::class),
                $app->make(ProductRateRepositoryInterface::class),
                $app->make(CollectionRepositoryInterface::class),
                $app->make(PaymentRepositoryInterface::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
