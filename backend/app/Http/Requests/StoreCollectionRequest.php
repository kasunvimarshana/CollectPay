<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;
use App\Models\Supplier;
use App\Models\Product;

class StoreCollectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) return false;
        $supplierId = (string) $this->input('supplier_id');
        $canRole = $user->hasAnyRole(['collector','manager','admin']);
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
            'product_id' => ['required','string', Rule::exists('products','id')],
            'quantity' => ['required','numeric','min:0.0001'],
            'unit' => ['required','string'],
            'notes' => ['nullable','string'],
            'collected_at' => ['nullable','date'],
        ];
    }
}
