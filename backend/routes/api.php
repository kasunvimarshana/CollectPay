<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\SupplierController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\ProductRateController;
use App\Http\Controllers\API\CollectionController;
use App\Http\Controllers\API\PaymentController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Supplier routes
    Route::apiResource('suppliers', SupplierController::class);

    // Product routes
    Route::apiResource('products', ProductController::class);

    // Product rate routes
    Route::apiResource('product-rates', ProductRateController::class);

    // Collection routes
    Route::apiResource('collections', CollectionController::class);

    // Payment routes
    Route::apiResource('payments', PaymentController::class);
    Route::get('/suppliers/{supplierId}/balance', [PaymentController::class, 'getSupplierBalance']);
});
