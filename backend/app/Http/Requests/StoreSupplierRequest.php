<?php

namespace App\Http\Requests;

class StoreSupplierRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'code' => 'sometimes|string|max:50|unique:suppliers,code',
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'status' => 'sometimes|in:active,inactive,suspended',
            'metadata' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'Supplier code already exists.',
            'status.in' => 'Status must be: active, inactive, or suspended.',
        ];
    }
}
