<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RateController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SyncController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Supplier routes
    Route::apiResource('suppliers', SupplierController::class);

    // Product routes
    Route::apiResource('products', ProductController::class);

    // Rate routes
    Route::get('rates/current', [RateController::class, 'current']);
    Route::apiResource('rates', RateController::class);

    // Collection routes
    Route::apiResource('collections', CollectionController::class);

    // Payment routes
    Route::get('payments/summary', [PaymentController::class, 'summary']);
    Route::apiResource('payments', PaymentController::class);

    // Sync routes
    Route::post('sync/collections', [SyncController::class, 'syncCollections']);
    Route::post('sync/payments', [SyncController::class, 'syncPayments']);
    Route::post('sync/updates', [SyncController::class, 'getUpdates']);
});
