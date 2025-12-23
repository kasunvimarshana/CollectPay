<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductRateController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SyncController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });

    // Supplier routes
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('suppliers/{supplier}/balance', [SupplierController::class, 'balance']);

    // Product routes
    Route::apiResource('products', ProductController::class);
    
    // Product Rate routes
    Route::apiResource('product-rates', ProductRateController::class);
    Route::get('products/{product}/rates', [ProductRateController::class, 'productRates']);
    Route::get('products/{product}/active-rate', [ProductRateController::class, 'activeRate']);

    // Collection routes
    Route::apiResource('collections', CollectionController::class);
    Route::post('collections/{collection}/confirm', [CollectionController::class, 'confirm']);
    Route::post('collections/{collection}/cancel', [CollectionController::class, 'cancel']);

    // Payment routes
    Route::apiResource('payments', PaymentController::class);
    Route::post('payments/{payment}/confirm', [PaymentController::class, 'confirm']);
    Route::get('suppliers/{supplier}/transactions', [PaymentController::class, 'transactions']);

    // Sync routes
    Route::prefix('sync')->group(function () {
        Route::post('push', [SyncController::class, 'push']);
        Route::get('pull', [SyncController::class, 'pull']);
        Route::get('status', [SyncController::class, 'status']);
        Route::post('resolve-conflict', [SyncController::class, 'resolveConflict']);
    });
});
