<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\SyncController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected routes
    Route::middleware(['auth.jwt'])->group(function () {
        // Auth routes
        Route::post('/auth/refresh', [AuthController::class, 'refresh']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // User management routes
        Route::apiResource('users', UserController::class);

        // Supplier routes
        Route::apiResource('suppliers', SupplierController::class);
        Route::get('/suppliers/search/{name}', [SupplierController::class, 'search']);

        // Collection routes
        Route::apiResource('collections', CollectionController::class);
        Route::get('/collections/supplier/{supplierId}', [CollectionController::class, 'bySupplier']);
        Route::post('/collections/{id}/approve', [CollectionController::class, 'approve']);
        Route::post('/collections/{id}/reject', [CollectionController::class, 'reject']);

        // Payment routes
        Route::apiResource('payments', PaymentController::class);
        Route::get('/payments/supplier/{supplierId}', [PaymentController::class, 'bySupplier']);
        Route::post('/payments/{id}/confirm', [PaymentController::class, 'confirm']);
        Route::post('/payments/{id}/cancel', [PaymentController::class, 'cancel']);

        // Sync routes
        Route::post('/sync/push', [SyncController::class, 'push']);
        Route::get('/sync/pull', [SyncController::class, 'pull']);
        Route::get('/sync/status', [SyncController::class, 'status']);

        // Dashboard/Analytics routes
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/supplier/{supplierId}/balance', [DashboardController::class, 'supplierBalance']);
    });
});
