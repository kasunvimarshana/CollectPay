<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollectionEntryController;
use App\Http\Controllers\Api\LedgerController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RateController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\UnitController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::apiResource('suppliers', SupplierController::class);
        Route::apiResource('products', ProductController::class);
        Route::apiResource('units', UnitController::class)->only(['index', 'show']);
        Route::apiResource('collection-entries', CollectionEntryController::class);
        Route::apiResource('payments', PaymentController::class);
        Route::apiResource('rates', RateController::class);

        Route::get('/suppliers/{supplier}/ledger', [LedgerController::class, 'supplierLedger']);

        Route::post('/sync', [SyncController::class, 'sync']);
    });
});
