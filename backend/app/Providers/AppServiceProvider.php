<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\AuthenticationService;
use App\Services\CollectionService;
use App\Services\PaymentService;
use App\Services\RateService;
use App\Services\SyncService;
use App\Repositories\CollectionRepository;
use App\Repositories\PaymentRepository;
use App\Repositories\RateRepository;
use Src\Domain\Repositories\CollectionRepositoryInterface;
use Src\Domain\Repositories\PaymentRepositoryInterface;
use Src\Domain\Repositories\RateRepositoryInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register services as singletons for better performance
        $this->app->singleton(AuthenticationService::class, function () {
            return new AuthenticationService();
        });

        $this->app->singleton(CollectionService::class, function () {
            return new CollectionService();
        });

        $this->app->singleton(PaymentService::class, function () {
            return new PaymentService();
        });

        $this->app->singleton(RateService::class, function () {
            return new RateService();
        });

        $this->app->singleton(SyncService::class, function () {
            return new SyncService();
        });

        // Register repositories with their interfaces
        $this->app->bind(CollectionRepositoryInterface::class, CollectionRepository::class);
        $this->app->bind(PaymentRepositoryInterface::class, PaymentRepository::class);
        $this->app->bind(RateRepositoryInterface::class, RateRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Ensure timestamps are in ISO-8601 format for JSON APIs
        \Illuminate\Support\Facades\DB::useDefaultSchemaGrammar();
    }
}
