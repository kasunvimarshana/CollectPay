<?php

namespace App\Infrastructure\Security;

/**
 * Authentication Service
 * Handles user authentication and token management
 */
class AuthService
{
    private const TOKEN_EXPIRY = 86400; // 24 hours
    
    /**
     * Verify password against hash
     */
    public static function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }
    
    /**
     * Hash password
     */
    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }
    
    /**
     * Generate authentication token
     */
    public static function generateToken(int $userId): string
    {
        $payload = [
            'user_id' => $userId,
            'exp' => time() + self::TOKEN_EXPIRY,
            'iat' => time(),
        ];
        
        return base64_encode(json_encode($payload));
    }
    
    /**
     * Verify and decode token
     */
    public static function verifyToken(string $token): ?array
    {
        try {
            $payload = json_decode(base64_decode($token), true);
            
            if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
                return null;
            }
            
            return $payload;
        } catch (\Exception $e) {
            return null;
        }
    }
    
    /**
     * Extract user ID from token
     */
    public static function getUserIdFromToken(string $token): ?int
    {
        $payload = self::verifyToken($token);
        return $payload['user_id'] ?? null;
    }
}
