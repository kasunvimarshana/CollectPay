<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Health check
Route::get('health', fn() => response()->json(['status' => 'ok', 'timestamp' => now()->toIso8601String()]));

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
        Route::post('refresh-token', [AuthController::class, 'refreshToken']);
    });

    // Sync
    Route::prefix('sync')->middleware('sync.validate')->group(function () {
        Route::post('push', [SyncController::class, 'push']);
        Route::post('pull', [SyncController::class, 'pull']);
        Route::get('status', [SyncController::class, 'status']);
        Route::post('checksum', [SyncController::class, 'checksum']);
    });

    // Suppliers
    Route::prefix('suppliers')->group(function () {
        Route::get('/', [SupplierController::class, 'index']);
        Route::post('/', [SupplierController::class, 'store'])->middleware('permission:suppliers.create');
        Route::get('regions', [SupplierController::class, 'regions']);
        Route::get('{supplier}', [SupplierController::class, 'show']);
        Route::put('{supplier}', [SupplierController::class, 'update'])->middleware('permission:suppliers.update');
        Route::delete('{supplier}', [SupplierController::class, 'destroy'])->middleware('permission:suppliers.delete');
        Route::get('{supplier}/balance', [SupplierController::class, 'balance']);
    });

    // Products
    Route::prefix('products')->group(function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::post('/', [ProductController::class, 'store'])->middleware('permission:products.create');
        Route::get('categories', [ProductController::class, 'categories']);
        Route::get('{product}', [ProductController::class, 'show']);
        Route::put('{product}', [ProductController::class, 'update'])->middleware('permission:products.update');
        Route::delete('{product}', [ProductController::class, 'destroy'])->middleware('permission:products.delete');
        
        // Rates
        Route::get('{product}/rates', [ProductController::class, 'rates']);
        Route::post('{product}/rates', [ProductController::class, 'storeRate'])->middleware('permission:rates.create');
        Route::get('{product}/rates/current', [ProductController::class, 'currentRate']);
        Route::put('{product}/rates/{rate}', [ProductController::class, 'updateRate'])->middleware('permission:rates.update');
        Route::delete('{product}/rates/{rate}', [ProductController::class, 'deleteRate'])->middleware('permission:rates.delete');
    });

    // Collections
    Route::prefix('collections')->group(function () {
        Route::get('/', [CollectionController::class, 'index']);
        Route::post('/', [CollectionController::class, 'store'])->middleware('permission:collections.create');
        Route::get('summary', [CollectionController::class, 'summary']);
        Route::get('{collection}', [CollectionController::class, 'show']);
        Route::put('{collection}', [CollectionController::class, 'update'])->middleware('permission:collections.update');
        Route::delete('{collection}', [CollectionController::class, 'destroy'])->middleware('permission:collections.delete');
        Route::post('{collection}/confirm', [CollectionController::class, 'confirm'])->middleware('permission:collections.update');
        Route::post('{collection}/dispute', [CollectionController::class, 'dispute']);
    });

    // Payments
    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index']);
        Route::post('/', [PaymentController::class, 'store'])->middleware('permission:payments.create');
        Route::get('summary', [PaymentController::class, 'summary']);
        Route::post('calculate-settlement', [PaymentController::class, 'calculateSettlement']);
        Route::post('create-settlement', [PaymentController::class, 'createSettlement'])->middleware('permission:payments.create');
        Route::get('supplier-statement', [PaymentController::class, 'supplierStatement']);
        Route::get('{payment}', [PaymentController::class, 'show']);
        Route::put('{payment}', [PaymentController::class, 'update'])->middleware('permission:payments.update');
        Route::delete('{payment}', [PaymentController::class, 'destroy'])->middleware('permission:payments.delete');
        Route::post('{payment}/approve', [PaymentController::class, 'approve'])->middleware('permission:payments.approve');
        Route::post('{payment}/complete', [PaymentController::class, 'complete'])->middleware('permission:payments.update');
        Route::post('{payment}/cancel', [PaymentController::class, 'cancel'])->middleware('permission:payments.update');
    });
});
