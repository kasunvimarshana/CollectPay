<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Logging Service
 *
 * Centralized logging service with consistent formatting
 */
class LoggingService
{
    /**
     * Log an info message
     */
    public static function info(string $message, array $context = []): void
    {
        Log::info($message, self::enrichContext($context));
    }

    /**
     * Log a warning message
     */
    public static function warning(string $message, array $context = []): void
    {
        Log::warning($message, self::enrichContext($context));
    }

    /**
     * Log an error message
     */
    public static function error(string $message, array $context = []): void
    {
        Log::error($message, self::enrichContext($context));
    }

    /**
     * Log a critical message
     */
    public static function critical(string $message, array $context = []): void
    {
        Log::critical($message, self::enrichContext($context));
    }

    /**
     * Log an API request
     */
    public static function apiRequest(string $method, string $url, array $data = [], ?int $userId = null): void
    {
        self::info('API Request', [
            'method' => $method,
            'url' => $url,
            'data' => $data,
            'user_id' => $userId,
        ]);
    }

    /**
     * Log an API response
     */
    public static function apiResponse(int $statusCode, string $url, float $duration): void
    {
        $level = $statusCode >= 500 ? 'error' : ($statusCode >= 400 ? 'warning' : 'info');

        self::$level('API Response', [
            'status_code' => $statusCode,
            'url' => $url,
            'duration_ms' => round($duration * 1000, 2),
        ]);
    }

    /**
     * Log a database query
     */
    public static function query(string $query, array $bindings, float $time): void
    {
        if ($time > 1000) { // Log slow queries (>1 second)
            self::warning('Slow Query Detected', [
                'query' => $query,
                'bindings' => $bindings,
                'time_ms' => $time,
            ]);
        }
    }

    /**
     * Log a security event
     */
    public static function security(string $event, array $context = []): void
    {
        self::warning('Security Event: '.$event, self::enrichContext($context));
    }

    /**
     * Log a business event
     */
    public static function business(string $event, array $context = []): void
    {
        self::info('Business Event: '.$event, self::enrichContext($context));
    }

    /**
     * Enrich context with additional information
     */
    private static function enrichContext(array $context): array
    {
        return array_merge($context, [
            'timestamp' => now()->toIso8601String(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'request_id' => request()->header('X-Request-ID', uniqid('req_')),
        ]);
    }
}
