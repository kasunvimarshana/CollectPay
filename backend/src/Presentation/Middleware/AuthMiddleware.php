<?php

declare(strict_types=1);

namespace TrackVault\Presentation\Middleware;

use TrackVault\Infrastructure\Security\JwtService;

/**
 * Authentication Middleware
 * 
 * Validates JWT tokens and authenticates requests
 */
final class AuthMiddleware
{
    private JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    public function handle(): bool
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $this->sendUnauthorized('Missing or invalid authorization header');
            return false;
        }

        $token = $matches[1];

        try {
            $payload = $this->jwtService->verify($token);
            
            // Store user info in request for downstream use
            $_SERVER['AUTHENTICATED_USER_ID'] = $payload['user_id'] ?? null;
            $_SERVER['AUTHENTICATED_USER_EMAIL'] = $payload['email'] ?? null;
            $_SERVER['AUTHENTICATED_USER_ROLES'] = $payload['roles'] ?? [];
            
            return true;
        } catch (\Exception $e) {
            $this->sendUnauthorized('Invalid or expired token');
            return false;
        }
    }

    private function sendUnauthorized(string $message): void
    {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => 'UNAUTHORIZED',
                'message' => $message,
            ],
        ]);
    }

    public static function checkRole(array $requiredRoles): bool
    {
        $userRoles = $_SERVER['AUTHENTICATED_USER_ROLES'] ?? [];
        
        foreach ($requiredRoles as $role) {
            if (in_array($role, $userRoles, true)) {
                return true;
            }
        }

        return false;
    }

    public static function getUserId(): ?string
    {
        return $_SERVER['AUTHENTICATED_USER_ID'] ?? null;
    }
}
