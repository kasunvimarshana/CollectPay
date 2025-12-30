<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCollectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if user has permission to create collections
        $user = $this->user();
        return $user && $user->role && 
               in_array('collections.create', $user->role->permissions ?? []);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'rate_id' => 'nullable|exists:rates,id',
            'collected_at' => 'required|date',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'total_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
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
            'supplier_id.required' => 'Supplier is required',
            'supplier_id.exists' => 'Selected supplier does not exist',
            'product_id.required' => 'Product is required',
            'product_id.exists' => 'Selected product does not exist',
            'collected_at.required' => 'Collection date is required',
            'quantity.required' => 'Quantity is required',
            'quantity.min' => 'Quantity must be greater than or equal to 0',
            'unit.required' => 'Unit is required',
        ];
    }
}
