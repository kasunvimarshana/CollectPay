<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RateController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\TransactionController;
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
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('suppliers/{id}/balance', [SupplierController::class, 'balance']);

    // Products
    Route::apiResource('products', ProductController::class);
    Route::get('products/{id}/rates/current', [ProductController::class, 'getCurrentRates']);

    // Rates
    Route::apiResource('rates', RateController::class);
    Route::get('rates/product/{productId}/effective', [RateController::class, 'getEffectiveRate']);

    // Transactions
    Route::apiResource('transactions', TransactionController::class);

    // Payments
    Route::apiResource('payments', PaymentController::class);

    // Sync
    Route::post('/sync/transactions', [SyncController::class, 'syncTransactions']);
    Route::post('/sync/payments', [SyncController::class, 'syncPayments']);
    Route::get('/sync/updates', [SyncController::class, 'getUpdates']);
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toDateTimeString(),
    ]);
});
