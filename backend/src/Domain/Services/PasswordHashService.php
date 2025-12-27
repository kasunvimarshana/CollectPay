<?php

declare(strict_types=1);

namespace TrackVault\Domain\Services;

/**
 * Password Hashing Service
 */
final class PasswordHashService
{
    private const DEFAULT_ALGO = PASSWORD_ARGON2ID;
    private const OPTIONS = [
        'memory_cost' => 65536,
        'time_cost' => 4,
        'threads' => 3,
    ];

    public function hash(string $password): string
    {
        if (empty($password)) {
            throw new \InvalidArgumentException('Password cannot be empty');
        }

        return password_hash($password, self::DEFAULT_ALGO, self::OPTIONS);
    }

    public function verify(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public function needsRehash(string $hash): bool
    {
        return password_needs_rehash($hash, self::DEFAULT_ALGO, self::OPTIONS);
    }
}
