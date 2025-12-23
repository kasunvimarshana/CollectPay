<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\SyncController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);
    
    // Products
    Route::apiResource('products', ProductController::class);
    
    // Collections
    Route::apiResource('collections', CollectionController::class);
    
    // Payments
    Route::apiResource('payments', PaymentController::class);
    
    // Sync
    Route::post('/sync', [SyncController::class, 'sync']);
    Route::post('/sync/conflicts/{conflict}/resolve', [SyncController::class, 'resolveConflict']);
});
