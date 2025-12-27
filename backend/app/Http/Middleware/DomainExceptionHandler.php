<?php

namespace App\Http\Middleware;

use App\Domain\Exceptions\DomainException;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;
use App\Domain\Exceptions\InvalidOperationException;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Domain Exception Handler Middleware
 * 
 * Converts domain exceptions to appropriate HTTP responses
 * following REST conventions and Clean Architecture principles.
 */
class DomainExceptionHandler
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            return $next($request);
        } catch (EntityNotFoundException $e) {
            return $this->toJsonResponse($e, 404);
        } catch (VersionConflictException $e) {
            return $this->toJsonResponse($e, 409, [
                'code' => 'VERSION_CONFLICT',
                'details' => 'The resource has been modified by another user. Please refresh and try again.',
            ]);
        } catch (InvalidOperationException $e) {
            return $this->toJsonResponse($e, 422, [
                'code' => 'INVALID_OPERATION',
            ]);
        } catch (DomainException $e) {
            return $this->toJsonResponse($e, 400);
        } catch (\InvalidArgumentException $e) {
            return $this->toJsonResponse($e, 422, [
                'code' => 'VALIDATION_ERROR',
            ]);
        }
    }

    /**
     * Convert exception to JSON response
     *
     * @param \Throwable $exception
     * @param int $statusCode
     * @param array $additionalData
     * @return JsonResponse
     */
    private function toJsonResponse(\Throwable $exception, int $statusCode, array $additionalData = []): JsonResponse
    {
        $response = [
            'error' => $exception->getMessage(),
            'status' => $statusCode,
        ];

        if (!empty($additionalData)) {
            $response = array_merge($response, $additionalData);
        }

        // In development, include stack trace
        if (config('app.debug')) {
            $response['trace'] = $exception->getTraceAsString();
        }

        return response()->json($response, $statusCode);
    }
}
