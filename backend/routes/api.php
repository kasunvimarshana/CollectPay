<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RateController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Authorization:
| - RBAC: role:admin, role:manager, role:collector
| - ABAC: permission:resource.action (e.g., permission:payments.create)
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes (all authenticated users)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Sync routes (all authenticated users)
    Route::prefix('sync')->group(function () {
        Route::post('/', [SyncController::class, 'sync']);
        Route::get('/pull', [SyncController::class, 'pullChanges']);
        Route::get('/full', [SyncController::class, 'fullSync']);
        Route::get('/status', [SyncController::class, 'status']);
    });

    // Suppliers - read access for all, write access for admin/manager
    Route::get('suppliers', [SupplierController::class, 'index']);
    Route::get('suppliers/{supplier}', [SupplierController::class, 'show']);
    Route::get('suppliers/{supplier}/balance', [SupplierController::class, 'balance']);
    
    Route::middleware('role:admin,manager')->group(function () {
        Route::post('suppliers', [SupplierController::class, 'store']);
        Route::put('suppliers/{supplier}', [SupplierController::class, 'update']);
        Route::delete('suppliers/{supplier}', [SupplierController::class, 'destroy']);
    });

    // Products - read access for all, write access for admin/manager
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product}', [ProductController::class, 'show']);
    
    Route::middleware('role:admin,manager')->group(function () {
        Route::post('products', [ProductController::class, 'store']);
        Route::put('products/{product}', [ProductController::class, 'update']);
        Route::delete('products/{product}', [ProductController::class, 'destroy']);
    });

    // Rates - read access for all, write access for admin/manager
    Route::get('rates', [RateController::class, 'index']);
    Route::get('rates/{rate}', [RateController::class, 'show']);
    Route::get('rates/applicable', [RateController::class, 'getApplicable']);
    
    Route::middleware('role:admin,manager')->group(function () {
        Route::post('rates', [RateController::class, 'store']);
        Route::put('rates/{rate}', [RateController::class, 'update']);
        Route::delete('rates/{rate}', [RateController::class, 'destroy']);
    });

    // Collections - full access for collectors, admin, manager
    Route::apiResource('collections', CollectionController::class);
    Route::get('collections/summary', [CollectionController::class, 'summary']);

    // Payments - requires specific permission
    Route::get('payments', [PaymentController::class, 'index']);
    Route::get('payments/{payment}', [PaymentController::class, 'show']);
    Route::post('payments/validate-amount', [PaymentController::class, 'validateAmount']);
    
    Route::middleware('permission:payments.create')->group(function () {
        Route::post('payments', [PaymentController::class, 'store']);
    });
    
    Route::middleware('permission:payments.update')->group(function () {
        Route::put('payments/{payment}', [PaymentController::class, 'update']);
    });
    
    Route::middleware('role:admin')->group(function () {
        Route::delete('payments/{payment}', [PaymentController::class, 'destroy']);
    });
});
