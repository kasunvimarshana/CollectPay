<?php

declare(strict_types=1);

namespace TrackVault\Infrastructure\Security;

/**
 * Data Encryption Service
 * 
 * Handles encryption and decryption of sensitive data
 */
final class EncryptionService
{
    private string $key;
    private string $cipher = 'aes-256-gcm';

    public function __construct(string $key)
    {
        if (strlen($key) !== 32) {
            throw new \InvalidArgumentException('Encryption key must be exactly 32 characters');
        }
        $this->key = $key;
    }

    public function encrypt(string $data): string
    {
        $ivLength = openssl_cipher_iv_length($this->cipher);
        $iv = openssl_random_pseudo_bytes($ivLength);
        
        $tag = '';
        $encrypted = openssl_encrypt(
            $data,
            $this->cipher,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            16
        );

        if ($encrypted === false) {
            throw new \RuntimeException('Encryption failed');
        }

        return base64_encode($iv . $tag . $encrypted);
    }

    public function decrypt(string $encryptedData): string
    {
        $data = base64_decode($encryptedData);
        
        $ivLength = openssl_cipher_iv_length($this->cipher);
        $iv = substr($data, 0, $ivLength);
        $tag = substr($data, $ivLength, 16);
        $encrypted = substr($data, $ivLength + 16);

        $decrypted = openssl_decrypt(
            $encrypted,
            $this->cipher,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($decrypted === false) {
            throw new \RuntimeException('Decryption failed');
        }

        return $decrypted;
    }

    public function hash(string $data): string
    {
        return hash_hmac('sha256', $data, $this->key);
    }

    public function verifyHash(string $data, string $hash): bool
    {
        return hash_equals($this->hash($data), $hash);
    }
}
