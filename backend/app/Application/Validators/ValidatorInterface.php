<?php

namespace App\Application\Validators;

/**
 * Validator Interface
 * 
 * Contract for all validators in the application layer.
 * Validators ensure business rules are enforced at the application boundary.
 */
interface ValidatorInterface
{
    /**
     * Validate the given data
     *
     * @param array $data
     * @return void
     * @throws \InvalidArgumentException
     */
    public function validate(array $data): void;

    /**
     * Get validation errors
     *
     * @return array
     */
    public function errors(): array;
}
