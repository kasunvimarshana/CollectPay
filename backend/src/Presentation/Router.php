<?php

declare(strict_types=1);

namespace TrackVault\Presentation;

/**
 * Simple Router
 * 
 * Handles routing of HTTP requests to controllers
 */
final class Router
{
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, callable $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, callable $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, callable $handler): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        // Remove query string
        $uri = parse_url($uri, PHP_URL_PATH);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $pattern = $this->convertPathToRegex($route['path']);
            
            if (preg_match($pattern, $uri, $matches)) {
                // Remove full match from params
                array_shift($matches);
                
                call_user_func_array($route['handler'], $matches);
                return;
            }
        }

        // No route found
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => 'NOT_FOUND',
                'message' => 'Route not found',
            ],
        ]);
    }

    private function convertPathToRegex(string $path): string
    {
        // Convert :param to named capture groups
        $pattern = preg_replace('/\/:([^\/]+)/', '/(?P<$1>[^/]+)', $path);
        
        return '#^' . $pattern . '$#';
    }
}
