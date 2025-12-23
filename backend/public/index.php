<?php

define('LARAVEL_START', microtime(true));

// Register the Composer autoloader
if (file_exists($autoload = __DIR__.'/../vendor/autoload.php')) {
    require $autoload;
}

// Bootstrap Laravel and handle the request
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

$response->send();

$kernel->terminate($request, $response);
