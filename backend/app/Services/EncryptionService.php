<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;

/**
 * Encryption Service
 * 
 * Handles encryption and decryption of sensitive data
 * Uses Laravel's built-in encryption which uses AES-256-CBC
 */
class EncryptionService
{
    /**
     * Encrypt sensitive data
     * 
     * @param mixed $data
     * @return string
     */
    public function encrypt($data): string
    {
        if (is_null($data)) {
            return '';
        }
        
        return Crypt::encryptString(is_array($data) ? json_encode($data) : (string)$data);
    }
    
    /**
     * Decrypt sensitive data
     * 
     * @param string $encrypted
     * @return mixed
     */
    public function decrypt(string $encrypted)
    {
        if (empty($encrypted)) {
            return null;
        }
        
        try {
            $decrypted = Crypt::decryptString($encrypted);
            
            // Try to decode as JSON
            $decoded = json_decode($decrypted, true);
            return json_last_error() === JSON_ERROR_NONE ? $decoded : $decrypted;
        } catch (\Exception $e) {
            // Return original if decryption fails (might be unencrypted data)
            return $encrypted;
        }
    }
    
    /**
     * Hash sensitive data (one-way)
     * 
     * @param string $data
     * @return string
     */
    public function hash(string $data): string
    {
        return hash('sha256', $data);
    }
    
    /**
     * Verify hash
     * 
     * @param string $data
     * @param string $hash
     * @return bool
     */
    public function verifyHash(string $data, string $hash): bool
    {
        return hash_equals($hash, $this->hash($data));
    }
    
    /**
     * Encrypt array of sensitive fields in a model
     * 
     * @param array $data
     * @param array $sensitiveFields
     * @return array
     */
    public function encryptFields(array $data, array $sensitiveFields): array
    {
        foreach ($sensitiveFields as $field) {
            if (isset($data[$field]) && !empty($data[$field])) {
                $data[$field] = $this->encrypt($data[$field]);
            }
        }
        
        return $data;
    }
    
    /**
     * Decrypt array of sensitive fields in a model
     * 
     * @param array $data
     * @param array $sensitiveFields
     * @return array
     */
    public function decryptFields(array $data, array $sensitiveFields): array
    {
        foreach ($sensitiveFields as $field) {
            if (isset($data[$field]) && !empty($data[$field])) {
                $data[$field] = $this->decrypt($data[$field]);
            }
        }
        
        return $data;
    }
}
