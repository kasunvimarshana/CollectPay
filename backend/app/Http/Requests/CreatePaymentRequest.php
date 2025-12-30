<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentRequest extends FormRequest
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
            'type' => 'required|string|in:advance,partial,final',
            'amount' => 'required|numeric|min:0.01|max:99999999',
            'currency' => 'nullable|string|size:3|in:USD,EUR,GBP,LKR',
            'payment_date' => 'required|date|before_or_equal:today',
            'paid_by' => 'required|string|uuid|exists:users,id',
            'reference_number' => 'nullable|string|max:100|regex:/^[A-Z0-9\-]+$/',
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
            'paid_by.exists' => 'The selected payer does not exist.',
            'type.in' => 'Payment type must be advance, partial, or final.',
            'amount.min' => 'Payment amount must be greater than zero.',
            'currency.in' => 'Invalid currency code.',
            'payment_date.before_or_equal' => 'Payment date cannot be in the future.',
            'reference_number.regex' => 'Reference number can only contain uppercase letters, numbers, and hyphens.',
        ];
    }
}
