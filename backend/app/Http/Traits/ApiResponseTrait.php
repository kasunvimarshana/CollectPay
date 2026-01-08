<?php

namespace App\Http\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * API Response Trait
 * 
 * Provides consistent API response formatting across all controllers
 */
trait ApiResponseTrait
{
    /**
     * Send success response
     *
     * @param  mixed  $data
     * @param  string  $message
     * @param  int  $code
     * @return JsonResponse
     */
    protected function successResponse($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    /**
     * Send error response
     *
     * @param  string  $message
     * @param  int  $code
     * @param  mixed  $errors
     * @return JsonResponse
     */
    protected function errorResponse(string $message, int $code = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Send validation error response
     *
     * @param  ValidationException  $exception
     * @return JsonResponse
     */
    protected function validationErrorResponse(ValidationException $exception): JsonResponse
    {
        return $this->errorResponse(
            'Validation failed',
            422,
            $exception->errors()
        );
    }

    /**
     * Send not found error response
     *
     * @param  string  $message
     * @return JsonResponse
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }

    /**
     * Send unauthorized error response
     *
     * @param  string  $message
     * @return JsonResponse
     */
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }

    /**
     * Send forbidden error response
     *
     * @param  string  $message
     * @return JsonResponse
     */
    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }

    /**
     * Handle exceptions and return appropriate response
     *
     * @param  \Exception  $exception
     * @return JsonResponse
     */
    protected function handleException(\Exception $exception): JsonResponse
    {
        if ($exception instanceof ValidationException) {
            return $this->validationErrorResponse($exception);
        }

        if ($exception instanceof ModelNotFoundException) {
            return $this->notFoundResponse('Resource not found');
        }

        // Log the exception for debugging
        \Log::error('API Exception: ' . $exception->getMessage(), [
            'exception' => get_class($exception),
            'trace' => $exception->getTraceAsString(),
        ]);

        // Return generic error in production
        if (app()->environment('production')) {
            return $this->errorResponse('An error occurred while processing your request', 500);
        }

        // Return detailed error in development
        return $this->errorResponse(
            $exception->getMessage(),
            500,
            config('app.debug') ? [
                'exception' => get_class($exception),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
            ] : null
        );
    }
}
