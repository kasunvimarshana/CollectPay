<?php

declare(strict_types=1);

namespace TrackVault\Infrastructure\Security;

use DateTimeImmutable;

/**
 * JWT Token Service
 * 
 * Handles JWT token creation and validation
 */
final class JwtService
{
    private string $secret;
    private string $algorithm;
    private int $expiry;

    public function __construct(string $secret, string $algorithm = 'HS256', int $expiry = 3600)
    {
        $this->secret = $secret;
        $this->algorithm = $algorithm;
        $this->expiry = $expiry;
    }

    public function generateToken(array $payload): string
    {
        $header = [
            'typ' => 'JWT',
            'alg' => $this->algorithm,
        ];

        $issuedAt = time();
        $expiration = $issuedAt + $this->expiry;

        $payload = array_merge($payload, [
            'iat' => $issuedAt,
            'exp' => $expiration,
        ]);

        $headerEncoded = $this->base64UrlEncode(json_encode($header));
        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));

        $signature = $this->generateSignature($headerEncoded, $payloadEncoded);

        return "{$headerEncoded}.{$payloadEncoded}.{$signature}";
    }

    public function validateToken(string $token): ?array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$headerEncoded, $payloadEncoded, $signature] = $parts;

        $expectedSignature = $this->generateSignature($headerEncoded, $payloadEncoded);

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $payload = json_decode($this->base64UrlDecode($payloadEncoded), true);

        if (!isset($payload['exp']) || $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    private function generateSignature(string $headerEncoded, string $payloadEncoded): string
    {
        $data = "{$headerEncoded}.{$payloadEncoded}";
        $signature = hash_hmac('sha256', $data, $this->secret, true);
        return $this->base64UrlEncode($signature);
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public function extractUserId(string $token): ?string
    {
        $payload = $this->validateToken($token);
        return $payload['user_id'] ?? null;
    }
}
