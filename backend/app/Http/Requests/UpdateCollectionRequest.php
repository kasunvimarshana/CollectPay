<?php

namespace App\Http\Requests;

class UpdateCollectionRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'quantity' => 'sometimes|numeric|min:0.01',
            'collection_date' => 'sometimes|date',
            'collection_time' => 'sometimes|date_format:H:i:s',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
