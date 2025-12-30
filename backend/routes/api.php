<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\SupplierController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\CollectionController;
use App\Http\Controllers\Api\V1\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public routes (if needed for registration/login)
    
    // Protected routes (require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        // Supplier routes
        Route::apiResource('suppliers', SupplierController::class);
        
        // Product routes
        Route::apiResource('products', ProductController::class);
        
        // Collection routes
        Route::apiResource('collections', CollectionController::class);
        
        // Payment routes
        Route::apiResource('payments', PaymentController::class);
        Route::get('suppliers/{id}/payments/summary', [PaymentController::class, 'summary']);
    });
});
