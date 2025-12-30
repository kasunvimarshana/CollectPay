<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Presentation\Http\Controllers\AuthController;
use Presentation\Http\Controllers\SupplierController;
use Presentation\Http\Controllers\ProductController;
use Presentation\Http\Controllers\CollectionController;
use Presentation\Http\Controllers\PaymentController;
use Presentation\Http\Controllers\UserController;

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

// Public routes - Authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
});

// Protected routes - Require authentication
Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
    });

    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);
    
    // Products
    Route::apiResource('products', ProductController::class);
    Route::post('products/{id}/rates', [ProductController::class, 'addRate'])->name('products.rates.add');
    
    // Collections
    Route::apiResource('collections', CollectionController::class)->except(['update']);
    Route::get('suppliers/{supplierId}/collections/total', [CollectionController::class, 'calculateTotal'])
        ->name('suppliers.collections.total');
    
    // Payments
    Route::apiResource('payments', PaymentController::class)->except(['update']);
    Route::get('suppliers/{supplierId}/payments/total', [PaymentController::class, 'calculateTotal'])
        ->name('suppliers.payments.total');
    Route::get('suppliers/{supplierId}/balance', [PaymentController::class, 'calculateBalance'])
        ->name('suppliers.balance');
    
    // Users - Admin only routes can be protected with role middleware later
    Route::apiResource('users', UserController::class)->except(['store']);
});

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
})->name('health');
