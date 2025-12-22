<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\SyncController;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/users', [UsersController::class, 'index']);
    Route::post('/users', [UsersController::class, 'store']);
    Route::put('/users/{id}', [UsersController::class, 'update']);
    Route::delete('/users/{id}', [UsersController::class, 'destroy']);

    Route::get('/sync', [SyncController::class, 'pull']);
    Route::post('/sync', [SyncController::class, 'push']);
});
