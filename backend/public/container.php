<?php

use LedgerFlow\Infrastructure\Persistence\SqliteUserRepository;
use LedgerFlow\Infrastructure\Persistence\SqliteSupplierRepository;
use LedgerFlow\Infrastructure\Persistence\SqliteProductRepository;
use LedgerFlow\Infrastructure\Persistence\SqliteProductRateRepository;
use LedgerFlow\Infrastructure\Persistence\SqliteCollectionRepository;
use LedgerFlow\Infrastructure\Persistence\SqlitePaymentRepository;
use LedgerFlow\Application\UseCases\CreateUser;
use LedgerFlow\Application\UseCases\CreateSupplier;
use LedgerFlow\Application\UseCases\CreateProduct;
use LedgerFlow\Application\UseCases\CreateCollection;
use LedgerFlow\Application\UseCases\CreatePayment;
use LedgerFlow\Application\Services\AuthenticationService;
use LedgerFlow\Application\Services\BalanceCalculationService;
use LedgerFlow\Application\Services\AuditLogService;
use LedgerFlow\Presentation\Controllers\AuthController;
use LedgerFlow\Presentation\Controllers\UserController;
use LedgerFlow\Presentation\Controllers\SupplierController;
use LedgerFlow\Presentation\Controllers\ProductController;
use LedgerFlow\Presentation\Controllers\CollectionController;
use LedgerFlow\Presentation\Controllers\PaymentController;

// Simple Dependency Injection Container
$container = [];

// Database
$container['db'] = function() {
    return require __DIR__ . '/bootstrap.php';
};

// Repositories
$container['userRepository'] = function($c) {
    return new SqliteUserRepository($c['db']());
};

$container['supplierRepository'] = function($c) {
    return new SqliteSupplierRepository($c['db']());
};

$container['productRepository'] = function($c) {
    return new SqliteProductRepository($c['db']());
};

$container['productRateRepository'] = function($c) {
    return new SqliteProductRateRepository($c['db']());
};

$container['collectionRepository'] = function($c) {
    return new SqliteCollectionRepository($c['db']());
};

$container['paymentRepository'] = function($c) {
    return new SqlitePaymentRepository($c['db']());
};

// Services
$container['authService'] = function($c) {
    return new AuthenticationService($c['userRepository']($c));
};

$container['balanceService'] = function($c) {
    return new BalanceCalculationService(
        $c['collectionRepository']($c),
        $c['paymentRepository']($c)
    );
};

$container['auditService'] = function($c) {
    return new AuditLogService($c['db']());
};

// Use Cases
$container['createUser'] = function($c) {
    return new CreateUser($c['userRepository']($c));
};

$container['createSupplier'] = function($c) {
    return new CreateSupplier($c['supplierRepository']($c));
};

$container['createProduct'] = function($c) {
    return new CreateProduct($c['productRepository']($c));
};

$container['createCollection'] = function($c) {
    return new CreateCollection(
        $c['collectionRepository']($c),
        $c['productRateRepository']($c),
        $c['supplierRepository']($c),
        $c['productRepository']($c)
    );
};

$container['createPayment'] = function($c) {
    return new CreatePayment(
        $c['paymentRepository']($c),
        $c['supplierRepository']($c)
    );
};

// Controllers
$container['authController'] = function($c) {
    return new AuthController($c['authService']($c));
};

$container['userController'] = function($c) {
    return new UserController($c['userRepository']($c), $c['createUser']($c));
};

$container['supplierController'] = function($c) {
    return new SupplierController(
        $c['supplierRepository']($c),
        $c['createSupplier']($c),
        $c['balanceService']($c)
    );
};

$container['productController'] = function($c) {
    return new ProductController(
        $c['productRepository']($c),
        $c['productRateRepository']($c),
        $c['createProduct']($c)
    );
};

$container['collectionController'] = function($c) {
    return new CollectionController(
        $c['collectionRepository']($c),
        $c['createCollection']($c)
    );
};

$container['paymentController'] = function($c) {
    return new PaymentController(
        $c['paymentRepository']($c),
        $c['createPayment']($c)
    );
};

return $container;
