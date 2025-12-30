<?php

declare(strict_types=1);

namespace LedgerFlow\Presentation\Controllers;

/**
 * Base Controller
 * 
 * Provides common functionality for all controllers.
 * Follows DRY principle - Don't Repeat Yourself.
 */
abstract class BaseController
{
    /**
     * Get JSON input from request body
     * 
     * @return array Decoded JSON data
     * @throws \InvalidArgumentException If JSON is invalid
     */
    protected function getJsonInput(): array
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException('Invalid JSON input: ' . json_last_error_msg());
        }
        
        return $data ?? [];
    }

    /**
     * Send JSON response with proper headers
     * 
     * @param int $statusCode HTTP status code
     * @param array $data Response data
     */
    protected function sendJsonResponse(int $statusCode, array $data): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_THROW_ON_ERROR);
    }

    /**
     * Send success response
     * 
     * @param mixed $data Response data
     * @param string|null $message Optional success message
     * @param int $statusCode HTTP status code (default 200)
     */
    protected function sendSuccessResponse($data, ?string $message = null, int $statusCode = 200): void
    {
        $response = [
            'success' => true,
            'data' => $data
        ];
        
        if ($message !== null) {
            $response['message'] = $message;
        }
        
        $this->sendJsonResponse($statusCode, $response);
    }

    /**
     * Send error response
     * 
     * @param int $statusCode HTTP status code
     * @param string $message Error message
     * @param array|null $errors Optional validation errors
     */
    protected function sendErrorResponse(int $statusCode, string $message, ?array $errors = null): void
    {
        $response = [
            'success' => false,
            'error' => $message
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        $this->sendJsonResponse($statusCode, $response);
    }

    /**
     * Send created response (201)
     * 
     * @param mixed $data Created resource data
     * @param string|null $message Optional success message
     */
    protected function sendCreatedResponse($data, ?string $message = null): void
    {
        $this->sendSuccessResponse($data, $message ?? 'Resource created successfully', 201);
    }

    /**
     * Send not found response (404)
     * 
     * @param string $message Error message
     */
    protected function sendNotFoundResponse(string $message = 'Resource not found'): void
    {
        $this->sendErrorResponse(404, $message);
    }

    /**
     * Send validation error response (400)
     * 
     * @param string $message Error message
     * @param array|null $errors Validation errors
     */
    protected function sendValidationErrorResponse(string $message, ?array $errors = null): void
    {
        $this->sendErrorResponse(400, $message, $errors);
    }

    /**
     * Send server error response (500)
     * 
     * @param string $message Error message
     */
    protected function sendServerErrorResponse(string $message = 'Internal server error'): void
    {
        $this->sendErrorResponse(500, $message);
    }

    /**
     * Parse integer ID from string
     * 
     * @param string $id String ID
     * @return int Parsed integer ID
     * @throws \InvalidArgumentException If ID is not a valid integer
     */
    protected function parseId(string $id): int
    {
        if (!is_numeric($id) || (int)$id <= 0) {
            throw new \InvalidArgumentException('Invalid ID format');
        }
        
        return (int)$id;
    }

    /**
     * Handle common exceptions
     * 
     * @param \Exception $e Exception to handle
     */
    protected function handleException(\Exception $e): void
    {
        if ($e instanceof \InvalidArgumentException) {
            $this->sendValidationErrorResponse($e->getMessage());
        } else {
            // Log error for debugging (in production, log to file)
            error_log($e->getMessage());
            $this->sendServerErrorResponse();
        }
    }
}
