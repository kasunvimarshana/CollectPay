<?php

namespace App\Http\Requests;

class SyncBatchRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'device_id' => 'required|string|max:100',
            'sync_data' => 'required|array',
            'sync_data.*.entity_type' => 'required|in:supplier,product,rate,collection,payment',
            'sync_data.*.operation' => 'required|in:create,update,delete',
            'sync_data.*.data' => 'required|array',
            'sync_data.*.version' => 'sometimes|integer|min:1',
            'sync_data.*.data.uuid' => 'required_if:sync_data.*.operation,create|uuid',
        ];
    }

    public function messages(): array
    {
        return [
            'sync_data.*.entity_type.in' => 'Invalid entity type. Must be: supplier, product, rate, collection, or payment.',
            'sync_data.*.operation.in' => 'Invalid operation. Must be: create, update, or delete.',
            'sync_data.*.data.uuid.required_if' => 'UUID is required for create operations.',
        ];
    }
}
