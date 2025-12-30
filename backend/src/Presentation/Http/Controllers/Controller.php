<?php

declare(strict_types=1);

namespace Presentation\Http\Controllers;

/**
 * Base Controller
 * 
 * Provides common functionality for all API controllers.
 * Follows Clean Architecture by keeping controllers thin and delegating
 * business logic to use cases.
 */
abstract class Controller
{
    /**
     * Return a successful JSON response.
     */
    protected function success(mixed $data, int $status = 200): \Illuminate\Http\JsonResponse
    {
        return response()->json($data, $status);
    }

    /**
     * Return an error JSON response.
     */
    protected function error(string $message, int $status = 400, ?array $errors = null): \Illuminate\Http\JsonResponse
    {
        $response = ['message' => $message];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        return response()->json($response, $status);
    }

    /**
     * Return a paginated JSON response.
     */
    protected function paginated(array $data): \Illuminate\Http\JsonResponse
    {
        return response()->json($data);
    }

    /**
     * Return a created resource response.
     */
    protected function created(mixed $data): \Illuminate\Http\JsonResponse
    {
        return response()->json($data, 201);
    }

    /**
     * Return a no content response.
     */
    protected function noContent(): \Illuminate\Http\JsonResponse
    {
        return response()->json(null, 204);
    }
}
