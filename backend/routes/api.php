<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\SupplierController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\ProductRateController;
use App\Http\Controllers\API\CollectionController;
use App\Http\Controllers\API\PaymentController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Resource routes
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('product-rates', ProductRateController::class);
    Route::apiResource('collections', CollectionController::class);
    Route::apiResource('payments', PaymentController::class);
});
