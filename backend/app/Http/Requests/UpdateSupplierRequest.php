<?php

namespace App\Http\Requests;

class UpdateSupplierRequest extends ApiRequest
{
    public function rules(): array
    {
        $supplierId = $this->route('supplier');
        
        return [
            'code' => "sometimes|string|max:50|unique:suppliers,code,{$supplierId}",
            'name' => 'sometimes|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'status' => 'sometimes|in:active,inactive,suspended',
            'metadata' => 'nullable|array',
        ];
    }
}
