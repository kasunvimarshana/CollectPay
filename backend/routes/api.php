<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductRateController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\SyncController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
});

// Protected routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    
    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);
    
    // Products
    Route::apiResource('products', ProductController::class);
    Route::get('suppliers/{supplier}/products', [ProductController::class, 'bySupplier']);
    
    // Product Rates
    Route::post('products/{product}/rates', [ProductRateController::class, 'store']);
    Route::get('products/{product}/rates', [ProductRateController::class, 'index']);
    Route::get('products/{product}/current-rate', [ProductRateController::class, 'current']);
    Route::apiResource('rates', ProductRateController::class)->except(['index', 'store']);
    
    // Payments
    Route::apiResource('payments', PaymentController::class);
    Route::get('suppliers/{supplier}/payments', [PaymentController::class, 'bySupplier']);
    
    // Sync
    Route::post('/sync/push', [SyncController::class, 'push']);
    Route::get('/sync/pull', [SyncController::class, 'pull']);
});
