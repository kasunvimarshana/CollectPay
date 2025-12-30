<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Product API Resource
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'unit' => $this->unit,
            'is_active' => $this->is_active ?? $this->isActive,
            'created_by' => $this->created_by ?? $this->createdBy,
            'created_at' => $this->created_at ?? $this->createdAt,
            'updated_at' => $this->updated_at ?? $this->updatedAt,
        ];
    }
}
