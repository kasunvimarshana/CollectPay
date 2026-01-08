<?php

namespace App\Exceptions;

use Exception;

/**
 * Resource Not Found Exception
 *
 * Used when a requested resource does not exist
 */
class ResourceNotFoundException extends Exception
{
    /**
     * Resource type that was not found
     *
     * @var string
     */
    protected $resourceType;

    /**
     * Resource identifier that was not found
     *
     * @var mixed
     */
    protected $resourceId;

    /**
     * Create a new resource not found exception
     *
     * @param  mixed  $resourceId
     */
    public function __construct(
        string $resourceType,
        $resourceId = null,
        ?string $message = null,
        ?\Exception $previous = null
    ) {
        $this->resourceType = $resourceType;
        $this->resourceId = $resourceId;

        $defaultMessage = $resourceId
            ? "{$resourceType} with ID {$resourceId} not found"
            : "{$resourceType} not found";

        parent::__construct($message ?? $defaultMessage, 404, $previous);
    }

    /**
     * Get the resource type
     */
    public function getResourceType(): string
    {
        return $this->resourceType;
    }

    /**
     * Get the resource ID
     *
     * @return mixed
     */
    public function getResourceId()
    {
        return $this->resourceId;
    }

    /**
     * Render the exception as an HTTP response
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function render()
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'resource_type' => $this->resourceType,
            'resource_id' => $this->resourceId,
        ], 404);
    }
}
