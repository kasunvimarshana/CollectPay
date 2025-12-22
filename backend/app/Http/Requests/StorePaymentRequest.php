<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) return false;
        $supplierId = (string) $this->input('supplier_id');
        $canRole = $user->hasAnyRole(['cashier','manager','admin']);
        $canSupplier = $supplierId ? $user->canAccessSupplier($supplierId) : true;
        return $canRole && $canSupplier;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'supplier_id' => ['required','string', Rule::exists('suppliers','id')],
            'amount' => ['required','numeric','min:0.01'],
            'currency' => ['required','string','size:3'],
            'type' => ['required','string', Rule::in(['partial','advance','full'])],
            'reference' => ['nullable','string'],
            'paid_at' => ['nullable','date'],
        ];
    }
}
