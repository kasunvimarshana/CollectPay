<?php

namespace App\Domain\Exceptions;

/**
 * Invalid Operation Exception
 * 
 * Thrown when an operation violates business rules.
 */
class InvalidOperationException extends DomainException
{
    public static function forOperation(string $operation, string $reason): self
    {
        return new self("Cannot {$operation}: {$reason}");
    }
}
