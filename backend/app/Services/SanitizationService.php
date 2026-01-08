<?php

namespace App\Services;

/**
 * Input Sanitization Service
 * 
 * Provides methods to sanitize and validate user inputs
 */
class SanitizationService
{
    /**
     * Sanitize string input
     *
     * @param  string|null  $input
     * @param  bool  $allowHtml
     * @return string|null
     */
    public static function sanitizeString(?string $input, bool $allowHtml = false): ?string
    {
        if ($input === null) {
            return null;
        }

        // Trim whitespace
        $sanitized = trim($input);

        if (empty($sanitized)) {
            return null;
        }

        if (!$allowHtml) {
            // Remove HTML tags
            $sanitized = strip_tags($sanitized);
        }

        // Convert special characters to HTML entities
        $sanitized = htmlspecialchars($sanitized, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return $sanitized;
    }

    /**
     * Sanitize email address
     *
     * @param  string|null  $email
     * @return string|null
     */
    public static function sanitizeEmail(?string $email): ?string
    {
        if ($email === null) {
            return null;
        }

        $email = trim(strtolower($email));
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);

        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }

    /**
     * Sanitize integer input
     *
     * @param  mixed  $input
     * @return int|null
     */
    public static function sanitizeInteger($input): ?int
    {
        if ($input === null) {
            return null;
        }

        $sanitized = filter_var($input, FILTER_SANITIZE_NUMBER_INT);
        $value = filter_var($sanitized, FILTER_VALIDATE_INT);

        return $value !== false ? $value : null;
    }

    /**
     * Sanitize float/decimal input
     *
     * @param  mixed  $input
     * @return float|null
     */
    public static function sanitizeFloat($input): ?float
    {
        if ($input === null) {
            return null;
        }

        $sanitized = filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
        $value = filter_var($sanitized, FILTER_VALIDATE_FLOAT);

        return $value !== false ? $value : null;
    }

    /**
     * Sanitize boolean input
     *
     * @param  mixed  $input
     * @return bool|null
     */
    public static function sanitizeBoolean($input): ?bool
    {
        if ($input === null) {
            return null;
        }

        if (is_bool($input)) {
            return $input;
        }

        $value = filter_var($input, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        return $value;
    }

    /**
     * Sanitize URL
     *
     * @param  string|null  $url
     * @return string|null
     */
    public static function sanitizeUrl(?string $url): ?string
    {
        if ($url === null) {
            return null;
        }

        $url = trim($url);
        $url = filter_var($url, FILTER_SANITIZE_URL);

        return filter_var($url, FILTER_VALIDATE_URL) ? $url : null;
    }

    /**
     * Sanitize phone number
     *
     * @param  string|null  $phone
     * @return string|null
     */
    public static function sanitizePhone(?string $phone): ?string
    {
        if ($phone === null) {
            return null;
        }

        // Remove all non-numeric and non-plus characters
        $sanitized = preg_replace('/[^0-9+]/', '', $phone);

        // Ensure only one plus sign at the beginning
        if (strpos($sanitized, '+') !== false) {
            $sanitized = '+' . str_replace('+', '', $sanitized);
        }

        return !empty($sanitized) ? $sanitized : null;
    }

    /**
     * Sanitize array input
     *
     * @param  array|null  $input
     * @param  callable|null  $callback
     * @return array|null
     */
    public static function sanitizeArray(?array $input, ?callable $callback = null): ?array
    {
        if ($input === null) {
            return null;
        }

        if ($callback) {
            return array_map($callback, $input);
        }

        return array_map(fn($item) => self::sanitizeString($item), $input);
    }

    /**
     * Remove SQL injection patterns
     *
     * @param  string|null  $input
     * @return string|null
     */
    public static function removeSqlInjection(?string $input): ?string
    {
        if ($input === null) {
            return null;
        }

        // Remove common SQL injection patterns
        $patterns = [
            '/(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i',
            '/(--|;|\||&&|\/\*|\*\/)/i',
        ];

        foreach ($patterns as $pattern) {
            $input = preg_replace($pattern, '', $input);
        }

        return $input;
    }

    /**
     * Remove XSS patterns
     *
     * @param  string|null  $input
     * @return string|null
     */
    public static function removeXss(?string $input): ?string
    {
        if ($input === null) {
            return null;
        }

        // Remove common XSS patterns
        $patterns = [
            '/<script\b[^>]*>(.*?)<\/script>/is',
            '/javascript:/i',
            '/on\w+\s*=/i', // onload=, onclick=, etc.
        ];

        foreach ($patterns as $pattern) {
            $input = preg_replace($pattern, '', $input);
        }

        return $input;
    }

    /**
     * Comprehensive input sanitization
     *
     * @param  mixed  $input
     * @param  string  $type
     * @return mixed
     */
    public static function sanitize($input, string $type = 'string')
    {
        return match ($type) {
            'string' => self::sanitizeString($input),
            'email' => self::sanitizeEmail($input),
            'integer', 'int' => self::sanitizeInteger($input),
            'float', 'decimal' => self::sanitizeFloat($input),
            'boolean', 'bool' => self::sanitizeBoolean($input),
            'url' => self::sanitizeUrl($input),
            'phone' => self::sanitizePhone($input),
            'array' => self::sanitizeArray($input),
            default => $input,
        };
    }
}
