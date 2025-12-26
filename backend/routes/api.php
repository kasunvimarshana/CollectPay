<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RateVersionController;
use App\Http\Controllers\SupplierBalanceController;
use App\Http\Controllers\SyncController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes - with throttling
Route::middleware('throttle.api:10,1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

// Protected routes
Route::middleware(['auth:sanctum', 'throttle.api:60,1'])->group(function () {
    // Auth routes
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Supplier routes - collectors and admins can manage
    Route::middleware('role:admin,collector')->group(function () {
        Route::apiResource('suppliers', SupplierController::class);
    });

    // Product routes - admins can create/update/delete, all can view
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    });

    // Rate version routes - admins manage rates, all can view
    Route::get('/rate-versions', [RateVersionController::class, 'index']);
    Route::get('/rate-versions/active', [RateVersionController::class, 'getActiveRate']);
    Route::get('/rate-versions/{id}', [RateVersionController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/rate-versions', [RateVersionController::class, 'store']);
        Route::put('/rate-versions/{id}', [RateVersionController::class, 'update']);
        Route::delete('/rate-versions/{id}', [RateVersionController::class, 'destroy']);
    });

    // Collection routes - collectors and admins can manage
    Route::middleware('role:admin,collector')->group(function () {
        Route::apiResource('collections', CollectionController::class);
    });

    // Payment routes - collectors and admins can manage
    Route::middleware('role:admin,collector')->group(function () {
        Route::apiResource('payments', PaymentController::class);
    });

    // Supplier balance routes - all authenticated users can view
    Route::get('/supplier-balances', [SupplierBalanceController::class, 'index']);
    Route::get('/supplier-balances/{supplierId}', [SupplierBalanceController::class, 'show']);

    // Sync routes - all authenticated users can sync
    Route::get('/sync/pull', [SyncController::class, 'pull']);
    Route::post('/sync/push', [SyncController::class, 'push']);
});
