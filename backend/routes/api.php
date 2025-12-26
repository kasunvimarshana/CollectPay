<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RateController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\SyncController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('v1')->group(function () {
    // Authentication
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('suppliers/{id}/balance', [SupplierController::class, 'balance']);

    // Products
    Route::apiResource('products', ProductController::class);
    Route::get('products/{id}/current-rate', [ProductController::class, 'getCurrentRate']);

    // Rates
    Route::apiResource('rates', RateController::class);
    Route::get('rates/history', [RateController::class, 'history'])->name('rates.history');

    // Collections
    Route::apiResource('collections', CollectionController::class);
    Route::get('collections/summary', [CollectionController::class, 'summary'])->name('collections.summary');

    // Payments
    Route::apiResource('payments', PaymentController::class);
    Route::post('payments/calculate-allocation', [PaymentController::class, 'calculateAllocation']);
    Route::get('payments/summary', [PaymentController::class, 'summary'])->name('payments.summary');

    // Sync
    Route::post('sync/push', [SyncController::class, 'push']);
    Route::post('sync/pull', [SyncController::class, 'pull']);
    Route::get('sync/status', [SyncController::class, 'status']);
    Route::post('sync/changes', [SyncController::class, 'changes']);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'version' => config('app.version', '1.0.0'),
    ]);
});
