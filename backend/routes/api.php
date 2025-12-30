<?php

use Illuminate\Support\Facades\Route;
use Presentation\Http\Controllers\Api\SupplierController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// API version 1
Route::prefix('v1')->group(function () {
    
    // Supplier routes
    Route::apiResource('suppliers', SupplierController::class);
    
    // Add more resource routes here as they are implemented:
    // Route::apiResource('products', ProductController::class);
    // Route::apiResource('collections', CollectionController::class);
    // Route::apiResource('payments', PaymentController::class);
});
