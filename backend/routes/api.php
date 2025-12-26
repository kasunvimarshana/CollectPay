<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Supplier routes
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('suppliers/{id}/balance', [SupplierController::class, 'balance']);

    // Product routes
    Route::apiResource('products', ProductController::class);
    Route::get('products/{id}/current-rates', [ProductController::class, 'getCurrentRates']);
    Route::post('products/{id}/rates', [ProductController::class, 'addRate']);

    // Collection routes
    Route::apiResource('collections', CollectionController::class);

    // Payment routes
    Route::apiResource('payments', PaymentController::class);
    Route::post('payments/{id}/approve', [PaymentController::class, 'approve']);
});
