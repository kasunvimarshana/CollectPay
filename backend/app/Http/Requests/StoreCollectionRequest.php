<?php

namespace App\Http\Requests;

class StoreCollectionRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'uuid' => 'sometimes|uuid|unique:collections,uuid',
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.01',
            'collection_date' => 'required|date',
            'collection_time' => 'sometimes|date_format:H:i:s',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_id.exists' => 'Selected supplier does not exist.',
            'product_id.exists' => 'Selected product does not exist.',
            'quantity.min' => 'Quantity must be greater than zero.',
        ];
    }
}
