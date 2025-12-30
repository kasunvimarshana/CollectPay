<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\SupplierController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\RateController;
use App\Http\Controllers\API\CollectionController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\ReportController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes with audit logging
Route::middleware(['auth:api', 'audit'])->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Resource routes with version conflict checking for updates
    Route::apiResource('users', UserController::class);
    Route::apiResource('roles', RoleController::class);
    
    // Suppliers with version conflict checking
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::post('/suppliers', [SupplierController::class, 'store']);
    Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->middleware('check.version');
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);
    
    // Products with version conflict checking
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::put('/products/{product}', [ProductController::class, 'update'])->middleware('check.version');
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    
    // Rates with version conflict checking
    Route::get('/rates', [RateController::class, 'index']);
    Route::post('/rates', [RateController::class, 'store']);
    Route::get('/rates/{rate}', [RateController::class, 'show']);
    Route::put('/rates/{rate}', [RateController::class, 'update'])->middleware('check.version');
    Route::delete('/rates/{rate}', [RateController::class, 'destroy']);
    
    // Collections with version conflict checking
    Route::get('/collections', [CollectionController::class, 'index']);
    Route::post('/collections', [CollectionController::class, 'store']);
    Route::get('/collections/{collection}', [CollectionController::class, 'show']);
    Route::put('/collections/{collection}', [CollectionController::class, 'update'])->middleware('check.version');
    Route::delete('/collections/{collection}', [CollectionController::class, 'destroy']);
    
    // Payments with version conflict checking
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::put('/payments/{payment}', [PaymentController::class, 'update'])->middleware('check.version');
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);
    
    // Custom routes for suppliers
    Route::get('/suppliers/{supplier}/balance', [SupplierController::class, 'balance']);
    Route::get('/suppliers/{supplier}/collections', [SupplierController::class, 'collections']);
    Route::get('/suppliers/{supplier}/payments', [SupplierController::class, 'payments']);
    
    // Custom routes for products
    Route::get('/products/{product}/current-rate', [ProductController::class, 'currentRate']);
    Route::get('/products/{product}/rate-history', [ProductController::class, 'rateHistory']);
    
    // Report routes
    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/supplier-balances', [ReportController::class, 'supplierBalances']);
    Route::get('/reports/collections-summary', [ReportController::class, 'collectionsSummary']);
    Route::get('/reports/payments-summary', [ReportController::class, 'paymentsSummary']);
    Route::get('/reports/product-performance', [ReportController::class, 'productPerformance']);
    Route::get('/reports/financial-summary', [ReportController::class, 'financialSummary']);
    
    // PDF Report routes
    Route::get('/reports/summary/pdf', [ReportController::class, 'summaryPdf']);
    Route::get('/reports/supplier-balances/pdf', [ReportController::class, 'supplierBalancesPdf']);
    Route::get('/reports/collections-summary/pdf', [ReportController::class, 'collectionsSummaryPdf']);
    Route::get('/reports/payments-summary/pdf', [ReportController::class, 'paymentsSummaryPdf']);
    Route::get('/reports/product-performance/pdf', [ReportController::class, 'productPerformancePdf']);
    Route::get('/reports/financial-summary/pdf', [ReportController::class, 'financialSummaryPdf']);
});
