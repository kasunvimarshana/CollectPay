<?php

namespace App\Http\Requests;

class StoreProductRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'code' => 'sometimes|string|max:50|unique:products,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'unit' => 'sometimes|string|max:20',
            'category' => 'nullable|string|max:100',
            'is_active' => 'sometimes|boolean',
            'metadata' => 'nullable|array',
        ];
    }
}
