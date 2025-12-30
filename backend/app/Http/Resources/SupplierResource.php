<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Supplier API Resource
 * 
 * Transforms supplier data for API responses
 */
class SupplierResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'contact_person' => $this->contact_person ?? $this->contactPerson,
            'is_active' => $this->is_active ?? $this->isActive,
            'created_by' => $this->created_by ?? $this->createdBy,
            'created_at' => $this->created_at ?? $this->createdAt,
            'updated_at' => $this->updated_at ?? $this->updatedAt,
        ];
    }
}
