<?php

namespace App\Domain\Exceptions;

/**
 * Version Conflict Exception
 * 
 * Thrown when optimistic locking detects a version conflict.
 */
class VersionConflictException extends DomainException
{
    public static function forEntity(string $entityName, int $expectedVersion, int $actualVersion): self
    {
        return new self(
            "{$entityName} version conflict: expected {$expectedVersion}, got {$actualVersion}. " .
            "Please refresh and try again."
        );
    }
}
