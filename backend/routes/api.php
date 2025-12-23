<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductRateController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-activity', [DashboardController::class, 'recentActivity']);

    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('/suppliers/{supplier}/balance', [SupplierController::class, 'balance']);
    Route::get('/suppliers/{supplier}/transactions', [SupplierController::class, 'transactions']);

    // Products
    Route::apiResource('products', ProductController::class);
    Route::get('/products/{product}/current-rate', [ProductController::class, 'currentRate']);

    // Product Rates (Admin only)
    Route::middleware('rbac:admin,manager')->group(function () {
        Route::apiResource('product-rates', ProductRateController::class)->except(['update']);
        Route::get('/products/{product}/rates', [ProductRateController::class, 'productRates']);
    });

    // Collections
    Route::apiResource('collections', CollectionController::class);
    Route::get('/my-collections', [CollectionController::class, 'myCollections']);

    // Payments (Admin and Manager only for create/update/delete)
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::middleware('rbac:admin,manager')->group(function () {
        Route::post('/payments', [PaymentController::class, 'store']);
        Route::put('/payments/{payment}', [PaymentController::class, 'update']);
        Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);
    });

    // Sync endpoints
    Route::prefix('sync')->group(function () {
        Route::post('/push', [SyncController::class, 'push']);
        Route::get('/pull', [SyncController::class, 'pull']);
        Route::get('/status', [SyncController::class, 'status']);
        Route::post('/resolve-conflict/{syncQueue}', [SyncController::class, 'resolveConflict']);
        Route::get('/conflicts', [SyncController::class, 'conflicts']);
    });
});
