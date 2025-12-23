<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CollectionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

// Protected routes
Route::prefix('v1')->middleware('auth:api')->group(function () {
    // Auth routes
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Sync routes
    Route::post('/sync/push', [SyncController::class, 'push']);
    Route::post('/sync/pull', [SyncController::class, 'pull']);
    Route::post('/sync', [SyncController::class, 'sync']);
    Route::get('/sync/status', [SyncController::class, 'status']);

    // Resource routes
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('suppliers/{id}/balance', [SupplierController::class, 'balance']);
    
    Route::apiResource('products', ProductController::class);
    Route::get('products/{id}/current-rate', [ProductController::class, 'currentRate']);
    
    Route::apiResource('collections', CollectionController::class);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});
