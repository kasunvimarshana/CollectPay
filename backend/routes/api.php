<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RateController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\SyncController;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Authentication
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('/suppliers/{id}/balance', [SupplierController::class, 'balance']);
    Route::get('/suppliers/{id}/statement', [SupplierController::class, 'statement']);

    // Products
    Route::apiResource('products', ProductController::class);

    // Rates
    Route::apiResource('rates', RateController::class);
    Route::get('/rates/current', [RateController::class, 'current']);

    // Collections
    Route::apiResource('collections', CollectionController::class);

    // Payments
    Route::apiResource('payments', PaymentController::class);
    Route::post('/payments/calculate', [PaymentController::class, 'calculate']);

    // Synchronization
    Route::post('/sync/push', [SyncController::class, 'push']);
    Route::get('/sync/pull', [SyncController::class, 'pull']);
    Route::get('/sync/status', [SyncController::class, 'status']);
    Route::post('/sync/resolve-conflict', [SyncController::class, 'resolveConflict']);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'database' => \DB::connection()->getPdo() ? 'connected' : 'disconnected'
    ]);
});
