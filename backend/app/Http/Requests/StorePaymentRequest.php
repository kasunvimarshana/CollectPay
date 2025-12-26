<?php

namespace App\Http\Requests;

class StorePaymentRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'uuid' => 'sometimes|uuid|unique:payments,uuid',
            'supplier_id' => 'required|exists:suppliers,id',
            'payment_type' => 'sometimes|in:full,partial,advance',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_time' => 'sometimes|date_format:H:i:s',
            'payment_method' => 'sometimes|in:cash,bank_transfer,check,other',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_id.exists' => 'Selected supplier does not exist.',
            'amount.min' => 'Amount must be greater than zero.',
            'payment_type.in' => 'Payment type must be: full, partial, or advance.',
        ];
    }
}
