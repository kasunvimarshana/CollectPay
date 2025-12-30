<?php

declare(strict_types=1);

namespace Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Create Supplier Request
 * 
 * Validates incoming requests for creating suppliers
 */
class CreateSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Add authorization logic here (e.g., check user permissions)
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'regex:/^[A-Z0-9_-]+$/i', 'unique:suppliers,code'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Supplier name is required',
            'code.required' => 'Supplier code is required',
            'code.unique' => 'This supplier code already exists',
            'code.regex' => 'Supplier code can only contain letters, numbers, hyphens and underscores',
            'email.email' => 'Please provide a valid email address',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422));
    }
}
