<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCollectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Will be handled by authentication middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'supplier_id' => 'required|string|uuid|exists:suppliers,id',
            'product_id' => 'required|string|uuid|exists:products,id',
            'rate_id' => 'required|string|uuid|exists:rates,id',
            'quantity_value' => 'required|numeric|min:0.0001|max:999999',
            'quantity_unit' => 'required|string|max:10|in:kg,g,mg,lb,oz,l,ml,gal,unit,piece,dozen',
            'total_amount' => 'required|numeric|min:0|max:99999999',
            'total_amount_currency' => 'nullable|string|size:3|in:USD,EUR,GBP,LKR',
            'collection_date' => 'required|date|before_or_equal:today',
            'collected_by' => 'required|string|uuid|exists:users,id',
            'notes' => 'nullable|string|max:1000',
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
            'supplier_id.exists' => 'The selected supplier does not exist.',
            'product_id.exists' => 'The selected product does not exist.',
            'rate_id.exists' => 'The selected rate does not exist.',
            'collected_by.exists' => 'The selected collector does not exist.',
            'quantity_value.min' => 'Quantity must be greater than zero.',
            'quantity_unit.in' => 'Invalid quantity unit.',
            'total_amount_currency.in' => 'Invalid currency code.',
            'collection_date.before_or_equal' => 'Collection date cannot be in the future.',
        ];
    }
}
