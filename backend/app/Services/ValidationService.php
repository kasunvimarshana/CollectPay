<?php

namespace App\Services;

use Illuminate\Support\Str;

/**
 * Input Validation and Sanitization Service
 * 
 * Provides comprehensive input validation and sanitization to prevent
 * XSS, SQL injection, and other security vulnerabilities.
 */
class ValidationService
{
    /**
     * Sanitize string input to prevent XSS
     * 
     * @param string|null $input
     * @return string|null
     */
    public function sanitizeString(?string $input): ?string
    {
        if (is_null($input)) {
            return null;
        }
        
        // Remove any HTML tags
        $sanitized = strip_tags($input);
        
        // Convert special characters to HTML entities
        $sanitized = htmlspecialchars($sanitized, ENT_QUOTES, 'UTF-8');
        
        // Trim whitespace
        $sanitized = trim($sanitized);
        
        return $sanitized;
    }
    
    /**
     * Sanitize email input
     * 
     * @param string|null $email
     * @return string|null
     */
    public function sanitizeEmail(?string $email): ?string
    {
        if (is_null($email)) {
            return null;
        }
        
        // Remove all illegal characters from email
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);
        
        // Validate email format
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return strtolower(trim($email));
        }
        
        return null;
    }
    
    /**
     * Sanitize phone number
     * 
     * @param string|null $phone
     * @return string|null
     */
    public function sanitizePhone(?string $phone): ?string
    {
        if (is_null($phone)) {
            return null;
        }
        
        // Remove all characters except digits, +, -, (, ), and spaces
        $sanitized = preg_replace('/[^0-9+\-() ]/', '', $phone);
        
        return trim($sanitized);
    }
    
    /**
     * Sanitize numeric input
     * 
     * @param mixed $input
     * @return float|null
     */
    public function sanitizeNumeric($input): ?float
    {
        if (is_null($input)) {
            return null;
        }
        
        // Remove any non-numeric characters except decimal point and minus sign
        $sanitized = preg_replace('/[^0-9.\-]/', '', (string)$input);
        
        return is_numeric($sanitized) ? (float)$sanitized : null;
    }
    
    /**
     * Sanitize integer input
     * 
     * @param mixed $input
     * @return int|null
     */
    public function sanitizeInteger($input): ?int
    {
        if (is_null($input)) {
            return null;
        }
        
        $sanitized = filter_var($input, FILTER_SANITIZE_NUMBER_INT);
        
        return is_numeric($sanitized) ? (int)$sanitized : null;
    }
    
    /**
     * Sanitize URL input
     * 
     * @param string|null $url
     * @return string|null
     */
    public function sanitizeUrl(?string $url): ?string
    {
        if (is_null($url)) {
            return null;
        }
        
        $url = filter_var($url, FILTER_SANITIZE_URL);
        
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $url;
        }
        
        return null;
    }
    
    /**
     * Validate and sanitize coordinate (latitude/longitude)
     * 
     * @param mixed $coord
     * @param string $type 'lat' or 'lon'
     * @return float|null
     */
    public function sanitizeCoordinate($coord, string $type = 'lat'): ?float
    {
        $value = $this->sanitizeNumeric($coord);
        
        if (is_null($value)) {
            return null;
        }
        
        if ($type === 'lat') {
            // Latitude must be between -90 and 90
            return ($value >= -90 && $value <= 90) ? $value : null;
        } else {
            // Longitude must be between -180 and 180
            return ($value >= -180 && $value <= 180) ? $value : null;
        }
    }
    
    /**
     * Sanitize array of inputs
     * 
     * @param array $data
     * @param array $rules
     * @return array
     */
    public function sanitizeArray(array $data, array $rules): array
    {
        $sanitized = [];
        
        foreach ($rules as $field => $type) {
            if (!isset($data[$field])) {
                continue;
            }
            
            $sanitized[$field] = match($type) {
                'string' => $this->sanitizeString($data[$field]),
                'email' => $this->sanitizeEmail($data[$field]),
                'phone' => $this->sanitizePhone($data[$field]),
                'numeric' => $this->sanitizeNumeric($data[$field]),
                'integer' => $this->sanitizeInteger($data[$field]),
                'url' => $this->sanitizeUrl($data[$field]),
                'latitude' => $this->sanitizeCoordinate($data[$field], 'lat'),
                'longitude' => $this->sanitizeCoordinate($data[$field], 'lon'),
                default => $data[$field],
            };
        }
        
        return $sanitized;
    }
    
    /**
     * Validate password strength
     * 
     * @param string $password
     * @return array
     */
    public function validatePasswordStrength(string $password): array
    {
        $errors = [];
        
        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters long';
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }
    
    /**
     * Check if string contains SQL injection attempts
     * 
     * @param string $input
     * @return bool
     */
    public function containsSqlInjection(string $input): bool
    {
        // Use single regex pattern for better performance
        $pattern = '/\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|xp_|--|\/\*|\*\/)\b/i';
        
        return preg_match($pattern, $input) === 1;
    }
    
    /**
     * Check if string contains XSS attempts
     * 
     * @param string $input
     * @return bool
     */
    public function containsXss(string $input): bool
    {
        // Use single regex pattern for better performance
        $pattern = '/<script|javascript:|onerror=|onload=|onclick=|onmouseover=|<iframe|<object|<embed/i';
        
        return preg_match($pattern, $input) === 1;
    }
}
