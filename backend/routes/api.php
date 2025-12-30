<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

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

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // User management routes
    Route::apiResource('users', App\Http\Controllers\Api\UserController::class);

    // Role and Permission routes
    Route::apiResource('roles', App\Http\Controllers\Api\RoleController::class);
    Route::apiResource('permissions', App\Http\Controllers\Api\PermissionController::class);
    Route::post('/roles/{role}/permissions', [App\Http\Controllers\Api\RoleController::class, 'assignPermissions']);
    Route::post('/users/{user}/roles', [App\Http\Controllers\Api\UserController::class, 'assignRoles']);

    // Supplier routes
    Route::apiResource('suppliers', App\Http\Controllers\Api\SupplierController::class);
    Route::get('/suppliers/{supplier}/collections', [App\Http\Controllers\Api\SupplierController::class, 'collections']);
    Route::get('/suppliers/{supplier}/payments', [App\Http\Controllers\Api\SupplierController::class, 'payments']);
    Route::get('/suppliers/{supplier}/balance', [App\Http\Controllers\Api\SupplierController::class, 'balance']);

    // Product routes
    Route::apiResource('products', App\Http\Controllers\Api\ProductController::class);
    Route::get('/products/{product}/rates', [App\Http\Controllers\Api\ProductController::class, 'rates']);
    Route::post('/products/{product}/rates', [App\Http\Controllers\Api\ProductController::class, 'addRate']);
    Route::get('/products/{product}/current-rate', [App\Http\Controllers\Api\ProductController::class, 'currentRate']);

    // Product Rate routes
    Route::apiResource('product-rates', App\Http\Controllers\Api\ProductRateController::class);

    // Collection routes
    Route::apiResource('collections', App\Http\Controllers\Api\CollectionController::class);
    Route::get('/collections/supplier/{supplier}', [App\Http\Controllers\Api\CollectionController::class, 'bySupplier']);
    Route::get('/collections/date/{date}', [App\Http\Controllers\Api\CollectionController::class, 'byDate']);

    // Payment routes
    Route::apiResource('payments', App\Http\Controllers\Api\PaymentController::class);
    Route::get('/payments/supplier/{supplier}', [App\Http\Controllers\Api\PaymentController::class, 'bySupplier']);
    Route::post('/payments/calculate', [App\Http\Controllers\Api\PaymentController::class, 'calculate']);

    // Audit Log routes
    Route::get('/audit-logs', [App\Http\Controllers\Api\AuditLogController::class, 'index']);
    Route::get('/audit-logs/{auditLog}', [App\Http\Controllers\Api\AuditLogController::class, 'show']);

    // Dashboard/Analytics routes
    Route::get('/dashboard/stats', [App\Http\Controllers\Api\DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-collections', [App\Http\Controllers\Api\DashboardController::class, 'recentCollections']);
    Route::get('/dashboard/recent-payments', [App\Http\Controllers\Api\DashboardController::class, 'recentPayments']);

    // Sync routes for offline support
    Route::prefix('sync')->group(function () {
        Route::post('/', [App\Http\Controllers\Api\SyncController::class, 'sync']);
        Route::get('/changes', [App\Http\Controllers\Api\SyncController::class, 'getChanges']);
        Route::post('/resolve-conflict', [App\Http\Controllers\Api\SyncController::class, 'resolveConflict']);
        Route::get('/status', [App\Http\Controllers\Api\SyncController::class, 'status']);
    });
});
