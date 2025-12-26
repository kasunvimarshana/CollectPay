<?php

namespace App\Domain\Exceptions;

/**
 * Entity Not Found Exception
 * 
 * Thrown when a requested entity cannot be found.
 */
class EntityNotFoundException extends DomainException
{
    public static function forEntity(string $entityName, int $id): self
    {
        return new self("{$entityName} with ID {$id} not found");
    }

    public static function forEntityByField(string $entityName, string $field, $value): self
    {
        return new self("{$entityName} with {$field} '{$value}' not found");
    }
}
