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
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers for version tracking and optimistic locking
        \App\Models\Supplier::observe(\App\Observers\SupplierObserver::class);
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);
        \App\Models\Collection::observe(\App\Observers\CollectionObserver::class);
        \App\Models\Payment::observe(\App\Observers\PaymentObserver::class);
        \App\Models\Rate::observe(\App\Observers\RateObserver::class);

        // Configure authentication to return JSON for API requests instead of redirecting
        // This prevents "Route [login] not defined" errors for JWT-based API authentication
        \Illuminate\Auth\Middleware\Authenticate::redirectUsing(function ($request) {
            // For API requests, return null to trigger JSON response via exception handler
            if ($request->expectsJson() || $request->is('api/*')) {
                return null;
            }

            // This is an API-only application - web routes are not supported
            // Return null for any non-API requests to trigger 401 JSON response
            return null;
        });
    }
}
