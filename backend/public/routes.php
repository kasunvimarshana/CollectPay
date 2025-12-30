<?php

// Simple Router Implementation
function route($method, $path, $callback) {
    global $routes;
    if (!isset($routes)) {
        $routes = [];
    }
    $routes[] = ['method' => $method, 'path' => $path, 'callback' => $callback];
}

// Parse URI
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Health check
route('GET', '/health', function() {
    http_response_code(200);
    echo json_encode([
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0'
    ]);
});

// Authentication routes
route('POST', '/api/v1/auth/login', function() use ($container) {
    $controller = $container['authController']($container);
    $controller->login();
});

route('POST', '/api/v1/auth/validate', function() use ($container) {
    $controller = $container['authController']($container);
    $controller->validate();
});

// User routes
route('GET', '/api/v1/users', function() use ($container) {
    $controller = $container['userController']($container);
    $controller->index();
});

route('POST', '/api/v1/users', function() use ($container) {
    $controller = $container['userController']($container);
    $controller->store();
});

route('GET', '/api/v1/users/{id}', function($params) use ($container) {
    $controller = $container['userController']($container);
    $controller->show($params['id']);
});

route('PUT', '/api/v1/users/{id}', function($params) use ($container) {
    $controller = $container['userController']($container);
    $controller->update($params['id']);
});

route('DELETE', '/api/v1/users/{id}', function($params) use ($container) {
    $controller = $container['userController']($container);
    $controller->delete($params['id']);
});

// Supplier routes
route('GET', '/api/v1/suppliers', function() use ($container) {
    $controller = $container['supplierController']($container);
    $controller->index();
});

route('POST', '/api/v1/suppliers', function() use ($container) {
    $controller = $container['supplierController']($container);
    $controller->store();
});

route('GET', '/api/v1/suppliers/{id}', function($params) use ($container) {
    $controller = $container['supplierController']($container);
    $controller->show($params['id']);
});

route('PUT', '/api/v1/suppliers/{id}', function($params) use ($container) {
    $controller = $container['supplierController']($container);
    $controller->update($params['id']);
});

route('DELETE', '/api/v1/suppliers/{id}', function($params) use ($container) {
    $controller = $container['supplierController']($container);
    $controller->delete($params['id']);
});

// Product routes
route('GET', '/api/v1/products', function() use ($container) {
    $controller = $container['productController']($container);
    $controller->index();
});

route('POST', '/api/v1/products', function() use ($container) {
    $controller = $container['productController']($container);
    $controller->store();
});

route('GET', '/api/v1/products/{id}', function($params) use ($container) {
    $controller = $container['productController']($container);
    $controller->show($params['id']);
});

route('PUT', '/api/v1/products/{id}', function($params) use ($container) {
    $controller = $container['productController']($container);
    $controller->update($params['id']);
});

route('DELETE', '/api/v1/products/{id}', function($params) use ($container) {
    $controller = $container['productController']($container);
    $controller->delete($params['id']);
});

route('POST', '/api/v1/products/{id}/rates', function($params) use ($container) {
    $controller = $container['productController']($container);
    $controller->addRate($params['id']);
});

// Collection routes
route('GET', '/api/v1/collections', function() use ($container) {
    $controller = $container['collectionController']($container);
    $controller->index();
});

route('POST', '/api/v1/collections', function() use ($container) {
    $controller = $container['collectionController']($container);
    $controller->store();
});

route('GET', '/api/v1/collections/{id}', function($params) use ($container) {
    $controller = $container['collectionController']($container);
    $controller->show($params['id']);
});

route('PUT', '/api/v1/collections/{id}', function($params) use ($container) {
    $controller = $container['collectionController']($container);
    $controller->update($params['id']);
});

route('DELETE', '/api/v1/collections/{id}', function($params) use ($container) {
    $controller = $container['collectionController']($container);
    $controller->delete($params['id']);
});

route('GET', '/api/v1/suppliers/{id}/collections', function($params) use ($container) {
    $controller = $container['collectionController']($container);
    $controller->bySupplier($params['id']);
});

// Payment routes
route('GET', '/api/v1/payments', function() use ($container) {
    $controller = $container['paymentController']($container);
    $controller->index();
});

route('POST', '/api/v1/payments', function() use ($container) {
    $controller = $container['paymentController']($container);
    $controller->store();
});

route('GET', '/api/v1/payments/{id}', function($params) use ($container) {
    $controller = $container['paymentController']($container);
    $controller->show($params['id']);
});

route('PUT', '/api/v1/payments/{id}', function($params) use ($container) {
    $controller = $container['paymentController']($container);
    $controller->update($params['id']);
});

route('DELETE', '/api/v1/payments/{id}', function($params) use ($container) {
    $controller = $container['paymentController']($container);
    $controller->delete($params['id']);
});

route('GET', '/api/v1/suppliers/{id}/payments', function($params) use ($container) {
    $controller = $container['paymentController']($container);
    $controller->bySupplier($params['id']);
});

// Balance route
route('GET', '/api/v1/balances', function() use ($container) {
    $service = $container['balanceService']($container);
    $balances = $service->calculateAllBalances();
    http_response_code(200);
    echo json_encode($balances);
});

route('GET', '/api/v1/suppliers/{id}/balance', function($params) use ($container) {
    $service = $container['balanceService']($container);
    $balance = $service->calculateSupplierBalance($params['id']);
    http_response_code(200);
    echo json_encode($balance);
});

// Route dispatcher
function dispatch($routes, $requestMethod, $requestUri) {
    foreach ($routes as $route) {
        // Convert route path with parameters to regex
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[a-zA-Z0-9_-]+)', $route['path']);
        $pattern = '#^' . $pattern . '$#';
        
        if ($route['method'] === $requestMethod && preg_match($pattern, $requestUri, $matches)) {
            // Extract parameters
            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
            call_user_func($route['callback'], $params);
            return true;
        }
    }
    
    // 404 Not Found
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
    return false;
}

// Dispatch the request
dispatch($routes, $requestMethod, $requestUri);
