<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use TrackVault\Presentation\Router;
use TrackVault\Presentation\Controllers\AuthController;
use TrackVault\Presentation\Controllers\SupplierController;
use TrackVault\Infrastructure\Persistence\DatabaseConnection;
use TrackVault\Infrastructure\Persistence\MysqlUserRepository;
use TrackVault\Infrastructure\Persistence\MysqlSupplierRepository;
use TrackVault\Infrastructure\Security\JwtService;
use TrackVault\Infrastructure\Logging\AuditLogger;
use TrackVault\Domain\Services\PasswordHashService;
use TrackVault\Application\UseCases\LoginUseCase;
use TrackVault\Application\UseCases\CreateUserUseCase;

// Load configuration
$config = require __DIR__ . '/../config/app.php';

// Set timezone
date_default_timezone_set($config['app']['timezone']);

// Error reporting
if ($config['app']['debug']) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// CORS headers
header('Access-Control-Allow-Origin: ' . ($config['cors']['allowed_origins'][0] ?? '*'));
header('Access-Control-Allow-Methods: ' . implode(', ', $config['cors']['allowed_methods']));
header('Access-Control-Allow-Headers: ' . implode(', ', $config['cors']['allowed_headers']));
header('Access-Control-Max-Age: ' . $config['cors']['max_age']);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Set content type
header('Content-Type: application/json');

// Initialize dependencies
try {
    $dbConnection = DatabaseConnection::getInstance($config['database']);
    $pdo = $dbConnection->getConnection();
    
    // Repositories
    $userRepository = new MysqlUserRepository($pdo);
    $supplierRepository = new MysqlSupplierRepository($pdo);
    $productRepository = new TrackVault\Infrastructure\Persistence\MysqlProductRepository($pdo);
    $collectionRepository = new TrackVault\Infrastructure\Persistence\MysqlCollectionRepository($pdo);
    $paymentRepository = new TrackVault\Infrastructure\Persistence\MysqlPaymentRepository($pdo);
    
    // Services
    $jwtService = new JwtService($config['security']['jwt_secret']);
    $auditLogger = new AuditLogger($pdo);
    $passwordHashService = new PasswordHashService();
    
    // Use Cases
    $loginUseCase = new LoginUseCase($userRepository, $passwordHashService, $jwtService);
    $createUserUseCase = new CreateUserUseCase($userRepository, $passwordHashService, $auditLogger);
    
    // Controllers
    $authController = new AuthController($loginUseCase, $createUserUseCase);
    $supplierController = new SupplierController($supplierRepository);
    $productController = new TrackVault\Presentation\Controllers\ProductController($productRepository);
    $collectionController = new TrackVault\Presentation\Controllers\CollectionController($collectionRepository);
    $paymentController = new TrackVault\Presentation\Controllers\PaymentController($paymentRepository);
    
    // Router
    $router = new Router();
    
    // Health check
    $router->get('/api/health', function() {
        echo json_encode([
            'status' => 'ok',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0',
        ]);
    });
    
    // Auth routes
    $router->post('/api/auth/login', [$authController, 'login']);
    $router->post('/api/auth/register', [$authController, 'register']);
    $router->post('/api/auth/logout', [$authController, 'logout']);
    
    // Supplier routes
    $router->get('/api/suppliers', [$supplierController, 'index']);
    $router->get('/api/suppliers/:id', [$supplierController, 'show']);
    $router->post('/api/suppliers', [$supplierController, 'store']);
    $router->put('/api/suppliers/:id', [$supplierController, 'update']);
    $router->delete('/api/suppliers/:id', [$supplierController, 'destroy']);
    
    // Product routes
    $router->get('/api/products', [$productController, 'index']);
    $router->get('/api/products/:id', [$productController, 'show']);
    $router->post('/api/products', [$productController, 'store']);
    $router->put('/api/products/:id', [$productController, 'update']);
    $router->delete('/api/products/:id', [$productController, 'destroy']);
    
    // Collection routes
    $router->get('/api/collections', [$collectionController, 'index']);
    $router->get('/api/collections/:id', [$collectionController, 'show']);
    $router->get('/api/collections/supplier/:supplierId', [$collectionController, 'bySupplier']);
    $router->post('/api/collections', [$collectionController, 'store']);
    $router->put('/api/collections/:id', [$collectionController, 'update']);
    $router->delete('/api/collections/:id', [$collectionController, 'destroy']);
    
    // Payment routes
    $router->get('/api/payments', [$paymentController, 'index']);
    $router->get('/api/payments/:id', [$paymentController, 'show']);
    $router->get('/api/payments/supplier/:supplierId', [$paymentController, 'bySupplier']);
    $router->post('/api/payments', [$paymentController, 'store']);
    $router->put('/api/payments/:id', [$paymentController, 'update']);
    $router->delete('/api/payments/:id', [$paymentController, 'destroy']);
    
    // Dispatch request
    $requestUri = $_SERVER['REQUEST_URI'];
    $requestMethod = $_SERVER['REQUEST_METHOD'];
    
    $router->dispatch($requestMethod, $requestUri);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => 'INTERNAL_ERROR',
            'message' => $config['app']['debug'] ? $e->getMessage() : 'Internal server error',
        ],
    ]);
}
