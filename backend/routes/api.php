<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\SupplierController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\RateController;
use App\Http\Controllers\API\CollectionController;
use App\Http\Controllers\API\PaymentController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Resource routes
    Route::apiResource('users', UserController::class);
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('rates', RateController::class);
    Route::apiResource('collections', CollectionController::class);
    Route::apiResource('payments', PaymentController::class);
    
    // Custom routes for suppliers
    Route::get('/suppliers/{supplier}/balance', [SupplierController::class, 'balance']);
    Route::get('/suppliers/{supplier}/collections', [SupplierController::class, 'collections']);
    Route::get('/suppliers/{supplier}/payments', [SupplierController::class, 'payments']);
    
    // Custom routes for products
    Route::get('/products/{product}/current-rate', [ProductController::class, 'currentRate']);
    Route::get('/products/{product}/rate-history', [ProductController::class, 'rateHistory']);
});
