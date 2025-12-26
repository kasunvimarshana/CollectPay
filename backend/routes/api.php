<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductRateController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // User management routes (admin only in production, use middleware)
    Route::apiResource('users', UserController::class);
    Route::post('users/{id}/toggle-active', [UserController::class, 'toggleActive']);

    // Supplier routes
    Route::apiResource('suppliers', SupplierController::class);

    // Product routes
    Route::apiResource('products', ProductController::class);
    Route::post('products/{id}/rates', [ProductController::class, 'addRate']);

    // Product Rate routes
    Route::apiResource('product-rates', ProductRateController::class);
    Route::get('product-rates/history/{productId}', [ProductRateController::class, 'history']);
    Route::get('product-rates/current', [ProductRateController::class, 'current']);

    // Collection routes
    Route::apiResource('collections', CollectionController::class);

    // Payment routes
    Route::apiResource('payments', PaymentController::class);
});
