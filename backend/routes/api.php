<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RateController;
use App\Http\Controllers\Api\SyncController;

// Public routes
Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/user', [AuthController::class, 'user']);

        // Collections
        Route::apiResource('collections', CollectionController::class);
        Route::get('collections/{uuid}/summary', [CollectionController::class, 'withPaymentSummary']);

        // Payments
        Route::apiResource('payments', PaymentController::class);
        Route::post('payments/batch', [PaymentController::class, 'batch']);

        // Rates
        Route::apiResource('rates', RateController::class);
        Route::get('rates/active/list', [RateController::class, 'active']);
        Route::get('rates/{name}/versions', [RateController::class, 'versions']);
        Route::post('rates/{uuid}/version', [RateController::class, 'createVersion']);
        Route::post('rates/{uuid}/deactivate', [RateController::class, 'deactivate']);

        // Sync
        Route::prefix('sync')->group(function () {
            Route::post('/pull', [SyncController::class, 'pull']);
            Route::post('/push', [SyncController::class, 'push']);
            Route::post('/resolve-conflicts', [SyncController::class, 'resolveConflicts']);
            Route::get('/status', [SyncController::class, 'status']);
            Route::post('/retry-failed', [SyncController::class, 'retryFailed']);
        });
    });
});

        Route::get('rates/active/list', [RateController::class, 'active']);

        // Sync endpoints
        Route::post('sync/pull', [SyncController::class, 'pull']);
        Route::post('sync/push', [SyncController::class, 'push']);
        Route::post('sync/resolve-conflicts', [SyncController::class, 'resolveConflicts']);
        Route::get('sync/status', [SyncController::class, 'status']);
    });
});
