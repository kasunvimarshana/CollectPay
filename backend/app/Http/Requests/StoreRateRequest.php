<?php

namespace App\Http\Requests;

class StoreRateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'rate' => 'required|numeric|min:0.01',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'applied_scope' => 'sometimes|in:general,supplier_specific',
            'notes' => 'nullable|string|max:500',
            'is_active' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.exists' => 'Selected product does not exist.',
            'supplier_id.exists' => 'Selected supplier does not exist.',
            'effective_to.after' => 'End date must be after start date.',
        ];
    }
}
