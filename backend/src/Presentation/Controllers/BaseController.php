<?php

declare(strict_types=1);

namespace TrackVault\Presentation\Controllers;

/**
 * Base Controller
 * 
 * Provides common functionality for all controllers
 */
abstract class BaseController
{
    protected function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
    }

    protected function successResponse($data = null, string $message = 'Success'): void
    {
        $this->jsonResponse([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ]);
    }

    protected function errorResponse(string $message, string $code = 'ERROR', int $statusCode = 400): void
    {
        $this->jsonResponse([
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ], $statusCode);
    }

    protected function getRequestBody(): array
    {
        $body = file_get_contents('php://input');
        return json_decode($body, true) ?? [];
    }

    protected function getRequestMethod(): string
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }

    protected function getAuthToken(): ?string
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
