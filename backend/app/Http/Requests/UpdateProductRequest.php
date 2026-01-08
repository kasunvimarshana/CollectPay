<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $productId = $this->route('product')->id ?? null;

        return [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:products,code,'.$productId,
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'units' => 'sometimes|required|array',
            'units.*' => 'string|max:50',
            'is_active' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required',
            'code.required' => 'Product code is required',
            'code.unique' => 'This product code is already in use',
            'units.required' => 'At least one unit of measurement is required',
            'units.array' => 'Units must be provided as an array',
        ];
    }
}
