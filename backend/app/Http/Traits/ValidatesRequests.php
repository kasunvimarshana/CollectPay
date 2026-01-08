<?php

namespace App\Http\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Validates Requests Trait
 * 
 * Provides consistent validation across all controllers
 */
trait ValidatesRequests
{
    /**
     * Validate request data
     *
     * @param  Request  $request
     * @param  array  $rules
     * @param  array  $messages
     * @param  array  $customAttributes
     * @return array
     * @throws ValidationException
     */
    protected function validateRequest(
        Request $request,
        array $rules,
        array $messages = [],
        array $customAttributes = []
    ): array {
        $validator = Validator::make(
            $request->all(),
            $rules,
            $messages,
            $customAttributes
        );

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    /**
     * Validate pagination parameters
     *
     * @param  Request  $request
     * @param  int  $maxPerPage
     * @return array
     */
    protected function validatePagination(Request $request, int $maxPerPage = 100): array
    {
        return [
            'per_page' => min((int) $request->get('per_page', 15), $maxPerPage),
            'page' => max((int) $request->get('page', 1), 1),
        ];
    }

    /**
     * Validate sorting parameters
     *
     * @param  Request  $request
     * @param  array  $allowedFields
     * @param  string  $defaultField
     * @param  string  $defaultOrder
     * @return array
     */
    protected function validateSorting(
        Request $request,
        array $allowedFields,
        string $defaultField = 'created_at',
        string $defaultOrder = 'desc'
    ): array {
        $sortBy = $request->get('sort_by', $defaultField);
        $sortOrder = $request->get('sort_order', $defaultOrder);

        // Validate sort field
        if (!in_array($sortBy, $allowedFields)) {
            $sortBy = $defaultField;
        }

        // Validate sort order
        if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
            $sortOrder = $defaultOrder;
        }

        return [
            'sort_by' => $sortBy,
            'sort_order' => strtolower($sortOrder),
        ];
    }

    /**
     * Validate date range parameters
     *
     * @param  Request  $request
     * @return array
     */
    protected function validateDateRange(Request $request): array
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        // Validate dates if provided
        if ($startDate && !strtotime($startDate)) {
            $startDate = null;
        }

        if ($endDate && !strtotime($endDate)) {
            $endDate = null;
        }

        // Ensure start date is before end date
        if ($startDate && $endDate && strtotime($startDate) > strtotime($endDate)) {
            $temp = $startDate;
            $startDate = $endDate;
            $endDate = $temp;
        }

        return [
            'start_date' => $startDate,
            'end_date' => $endDate,
        ];
    }

    /**
     * Sanitize input string
     *
     * @param  string|null  $input
     * @return string|null
     */
    protected function sanitizeInput(?string $input): ?string
    {
        if ($input === null) {
            return null;
        }

        // Remove potentially harmful characters
        $sanitized = strip_tags($input);
        $sanitized = htmlspecialchars($sanitized, ENT_QUOTES, 'UTF-8');
        
        return trim($sanitized);
    }

    /**
     * Validate and sanitize search query
     *
     * @param  Request  $request
     * @param  int  $maxLength
     * @return string|null
     */
    protected function validateSearch(Request $request, int $maxLength = 255): ?string
    {
        $search = $request->get('search');

        if (!$search) {
            return null;
        }

        $search = $this->sanitizeInput($search);

        // Limit search length
        if (strlen($search) > $maxLength) {
            $search = substr($search, 0, $maxLength);
        }

        return $search;
    }
}
