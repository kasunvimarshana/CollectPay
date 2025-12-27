<?php

namespace App\Application\Validators;

/**
 * Abstract Base Validator
 * 
 * Provides common validation functionality for application layer validators.
 * Follows Template Method pattern for consistent validation behavior.
 */
abstract class AbstractValidator implements ValidatorInterface
{
    protected array $errors = [];

    /**
     * Validate the given data
     *
     * @param array $data
     * @return void
     * @throws \InvalidArgumentException
     */
    public function validate(array $data): void
    {
        $this->errors = [];
        $this->doValidate($data);

        if (!empty($this->errors)) {
            throw new \InvalidArgumentException($this->formatErrors());
        }
    }

    /**
     * Perform the actual validation
     *
     * @param array $data
     * @return void
     */
    abstract protected function doValidate(array $data): void;

    /**
     * Get validation errors
     *
     * @return array
     */
    public function errors(): array
    {
        return $this->errors;
    }

    /**
     * Add an error message
     *
     * @param string $field
     * @param string $message
     * @return void
     */
    protected function addError(string $field, string $message): void
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    /**
     * Format errors as a single string
     *
     * @return string
     */
    protected function formatErrors(): string
    {
        $messages = [];
        foreach ($this->errors as $field => $fieldErrors) {
            foreach ($fieldErrors as $error) {
                $messages[] = "{$field}: {$error}";
            }
        }
        return implode('; ', $messages);
    }

    /**
     * Validate required field
     *
     * @param array $data
     * @param string $field
     * @return void
     */
    protected function validateRequired(array $data, string $field): void
    {
        if (!isset($data[$field]) || $data[$field] === null || $data[$field] === '') {
            $this->addError($field, 'This field is required');
        }
    }

    /**
     * Validate email format
     *
     * @param array $data
     * @param string $field
     * @return void
     */
    protected function validateEmail(array $data, string $field): void
    {
        if (isset($data[$field]) && $data[$field] !== null && $data[$field] !== '') {
            if (!filter_var($data[$field], FILTER_VALIDATE_EMAIL)) {
                $this->addError($field, 'Invalid email format');
            }
        }
    }

    /**
     * Validate maximum length
     *
     * @param array $data
     * @param string $field
     * @param int $maxLength
     * @return void
     */
    protected function validateMaxLength(array $data, string $field, int $maxLength): void
    {
        if (isset($data[$field]) && strlen($data[$field]) > $maxLength) {
            $this->addError($field, "Maximum length is {$maxLength} characters");
        }
    }

    /**
     * Validate positive number
     *
     * @param array $data
     * @param string $field
     * @return void
     */
    protected function validatePositive(array $data, string $field): void
    {
        if (isset($data[$field]) && $data[$field] <= 0) {
            $this->addError($field, 'Must be a positive number');
        }
    }
}
