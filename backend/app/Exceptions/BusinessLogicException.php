<?php

namespace App\Exceptions;

use Exception;

/**
 * Business Logic Exception
 * 
 * Used for business rule violations and domain-specific errors
 */
class BusinessLogicException extends Exception
{
    /**
     * Error code for the exception
     *
     * @var string
     */
    protected $errorCode;

    /**
     * Additional error data
     *
     * @var array
     */
    protected $errorData;

    /**
     * Create a new business logic exception
     *
     * @param  string  $message
     * @param  string|null  $errorCode
     * @param  array  $errorData
     * @param  int  $code
     * @param  \Exception|null  $previous
     */
    public function __construct(
        string $message = 'A business logic error occurred',
        ?string $errorCode = null,
        array $errorData = [],
        int $code = 422,
        ?\Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        
        $this->errorCode = $errorCode;
        $this->errorData = $errorData;
    }

    /**
     * Get the error code
     *
     * @return string|null
     */
    public function getErrorCode(): ?string
    {
        return $this->errorCode;
    }

    /**
     * Get the error data
     *
     * @return array
     */
    public function getErrorData(): array
    {
        return $this->errorData;
    }

    /**
     * Convert exception to array
     *
     * @return array
     */
    public function toArray(): array
    {
        $result = [
            'success' => false,
            'message' => $this->getMessage(),
        ];

        if ($this->errorCode) {
            $result['error_code'] = $this->errorCode;
        }

        if (!empty($this->errorData)) {
            $result['data'] = $this->errorData;
        }

        return $result;
    }

    /**
     * Render the exception as an HTTP response
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function render()
    {
        return response()->json($this->toArray(), $this->getCode() ?: 422);
    }
}
