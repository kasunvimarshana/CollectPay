<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SuppliersController;
use App\Http\Controllers\Api\V1\ProductsController;
use App\Http\Controllers\Api\V1\RatesController;
use App\Http\Controllers\Api\V1\CollectionsController;
use App\Http\Controllers\Api\V1\PaymentsController;
use App\Http\Controllers\Api\V1\SchedulesController;
use App\Http\Controllers\Api\V1\UsersController;
use App\Http\Controllers\Api\V1\SyncController;

Route::prefix('v1')->group(function () {
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

    Route::middleware(['auth:sanctum','throttle:api'])->group(function () {
        Route::apiResource('suppliers', SuppliersController::class);
        Route::apiResource('products', ProductsController::class);
        Route::apiResource('rates', RatesController::class)->only(['index','store','update','destroy','show']);
        Route::apiResource('collections', CollectionsController::class)->only(['index','store','show']);
        Route::apiResource('payments', PaymentsController::class)->only(['index','store','show']);
        Route::apiResource('schedules', SchedulesController::class);
        Route::apiResource('users', UsersController::class);

        Route::post('sync', SyncController::class);
        Route::get('suppliers/{supplier}/payable', [PaymentsController::class, 'payable']);
    });
});
