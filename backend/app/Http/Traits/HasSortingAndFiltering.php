<?php

namespace App\Http\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Trait HasSortingAndFiltering
 * 
 * Provides reusable sorting and filtering functionality for API controllers
 * following DRY principles and maintaining consistent behavior across endpoints.
 */
trait HasSortingAndFiltering
{
    /**
     * Apply sorting to a query based on request parameters
     * 
     * @param Builder $query The query builder instance
     * @param Request $request The HTTP request
     * @param array $allowedFields List of fields that can be sorted
     * @param string $defaultField Default field to sort by
     * @param string $defaultOrder Default sort order (asc|desc)
     * @return Builder
     */
    protected function applySorting(
        Builder $query,
        Request $request,
        array $allowedFields,
        string $defaultField = 'created_at',
        string $defaultOrder = 'desc'
    ): Builder {
        $sortBy = $request->get('sort_by', $defaultField);
        $sortOrder = $request->get('sort_order', $defaultOrder);
        
        // Validate sort field and order
        if (in_array($sortBy, $allowedFields) && in_array($sortOrder, ['asc', 'desc'])) {
            return $query->orderBy($sortBy, $sortOrder);
        }
        
        // Fallback to default sorting
        return $query->orderBy($defaultField, $defaultOrder);
    }
    
    /**
     * Apply search filtering to a query
     * 
     * @param Builder $query The query builder instance
     * @param Request $request The HTTP request
     * @param array $searchableFields List of fields to search in
     * @param string $searchParam The request parameter name for search (default: 'search')
     * @param int $maxLength Maximum allowed length for search term (default: 100)
     * @return Builder
     */
    protected function applySearch(
        Builder $query,
        Request $request,
        array $searchableFields,
        string $searchParam = 'search',
        int $maxLength = 100
    ): Builder {
        if (!$request->has($searchParam) || empty($searchableFields)) {
            return $query;
        }
        
        $search = $request->get($searchParam);
        
        // Validate and sanitize search input
        if (empty($search) || !is_string($search)) {
            return $query;
        }
        
        // Limit search term length to prevent performance issues
        $search = substr($search, 0, $maxLength);
        
        return $query->where(function($q) use ($search, $searchableFields) {
            foreach ($searchableFields as $index => $field) {
                if ($index === 0) {
                    $q->where($field, 'like', "%{$search}%");
                } else {
                    $q->orWhere($field, 'like', "%{$search}%");
                }
            }
        });
    }
    
    /**
     * Apply pagination to a query
     * 
     * @param Builder $query The query builder instance
     * @param Request $request The HTTP request
     * @param int $defaultPerPage Default number of results per page
     * @param int $maxPerPage Maximum allowed results per page
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    protected function applyPagination(
        Builder $query,
        Request $request,
        int $defaultPerPage = 15,
        int $maxPerPage = 100
    ) {
        $perPage = $request->get('per_page', $defaultPerPage);
        
        // Validate that per_page is a positive integer
        if (!is_numeric($perPage) || $perPage < 1) {
            $perPage = $defaultPerPage;
        }
        
        // Ensure per_page doesn't exceed maximum and is an integer
        $perPage = min((int)$perPage, $maxPerPage);
        
        return $query->paginate($perPage);
    }
    
    /**
     * Apply date range filtering to a query
     * 
     * @param Builder $query The query builder instance
     * @param Request $request The HTTP request
     * @param string $dateField The database field to filter on
     * @param string $startDateParam Request parameter for start date
     * @param string $endDateParam Request parameter for end date
     * @return Builder
     */
    protected function applyDateFilter(
        Builder $query,
        Request $request,
        string $dateField,
        string $startDateParam = 'start_date',
        string $endDateParam = 'end_date'
    ): Builder {
        if ($request->has($startDateParam)) {
            $startDate = $request->get($startDateParam);
            // Validate date format (YYYY-MM-DD)
            if ($this->isValidDate($startDate)) {
                $query->where($dateField, '>=', $startDate);
            }
        }
        
        if ($request->has($endDateParam)) {
            $endDate = $request->get($endDateParam);
            // Validate date format (YYYY-MM-DD)
            if ($this->isValidDate($endDate)) {
                $query->where($dateField, '<=', $endDate);
            }
        }
        
        return $query;
    }
    
    /**
     * Validate if a string is a valid date in Y-m-d format
     * 
     * @param mixed $date The date string to validate
     * @return bool
     */
    private function isValidDate($date): bool
    {
        if (!is_string($date)) {
            return false;
        }
        
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
    
    /**
     * Apply boolean filter to a query
     * 
     * @param Builder $query The query builder instance
     * @param Request $request The HTTP request
     * @param string $field The database field to filter on
     * @param string $param The request parameter name
     * @return Builder
     */
    protected function applyBooleanFilter(
        Builder $query,
        Request $request,
        string $field,
        string $param
    ): Builder {
        if (!$request->has($param)) {
            return $query;
        }
        
        $value = $request->get($param);
        
        // Validate boolean value
        // Accept: true, false, 1, 0, "1", "0", "true", "false"
        if (is_bool($value)) {
            $query->where($field, $value);
        } elseif ($value === 1 || $value === 0) {
            $query->where($field, (bool)$value);
        } elseif (is_string($value)) {
            $lowerValue = strtolower($value);
            if (in_array($lowerValue, ['true', '1'])) {
                $query->where($field, true);
            } elseif (in_array($lowerValue, ['false', '0'])) {
                $query->where($field, false);
            }
        }
        
        return $query;
    }
}
