<?php

namespace LedgerFlow\Application\Services;

use LedgerFlow\Domain\Repositories\UserRepositoryInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthenticationService
{
    private UserRepositoryInterface $userRepository;
    private string $jwtSecret;
    private int $jwtExpiration;

    public function __construct(UserRepositoryInterface $userRepository, string $jwtSecret = null, int $jwtExpiration = 86400)
    {
        $this->userRepository = $userRepository;
        $this->jwtSecret = $jwtSecret ?? getenv('JWT_SECRET') ?? 'default-secret-change-in-production';
        $this->jwtExpiration = $jwtExpiration; // 24 hours by default
    }

    public function login(string $email, string $password): array
    {
        // Find user by email
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            throw new \InvalidArgumentException('Invalid credentials');
        }

        // Verify password
        if (!password_verify($password, $user->getPasswordHash())) {
            throw new \InvalidArgumentException('Invalid credentials');
        }

        // Generate JWT token
        $token = $this->generateToken($user->getId(), $user->getEmail(), $user->getRole());

        return [
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'role' => $user->getRole()
            ]
        ];
    }

    public function validateToken(string $token): ?array
    {
        try {
            // For simplicity, using a basic JWT decode without external library
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return null;
            }

            $payload = json_decode(base64_decode($parts[1]), true);

            // Verify signature
            $signature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], $this->jwtSecret, true);
            $encodedSignature = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');

            if ($encodedSignature !== $parts[2]) {
                return null;
            }

            // Check expiration
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                return null;
            }

            return $payload;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function generateToken(string $userId, string $email, string $role): string
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $userId,
            'email' => $email,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + $this->jwtExpiration
        ]);

        $base64UrlHeader = rtrim(strtr(base64_encode($header), '+/', '-_'), '=');
        $base64UrlPayload = rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');

        $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, $this->jwtSecret, true);
        $base64UrlSignature = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');

        return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
    }
}
