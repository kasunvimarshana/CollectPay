<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RateController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public API routes (for now - add auth middleware later)
Route::prefix('v1')->group(function () {
    // Users
    Route::apiResource('users', UserController::class);
    
    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);
    
    // Products
    Route::apiResource('products', ProductController::class);
    
    // Rates
    Route::apiResource('rates', RateController::class);
    Route::get('products/{productId}/rates', [RateController::class, 'byProduct']);
    Route::get('products/{productId}/rates/latest', [RateController::class, 'latest']);
    
    // Collections
    Route::apiResource('collections', CollectionController::class);
    
    // Payments
    Route::apiResource('payments', PaymentController::class);
    Route::get('suppliers/{supplierId}/balance', [PaymentController::class, 'calculateBalance']);
});

