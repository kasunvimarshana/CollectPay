<?php

declare(strict_types=1);

namespace Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Domain\Entities\Supplier;

/**
 * Supplier Resource
 * 
 * Transforms Supplier entity for JSON response
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
        /** @var Supplier $supplier */
        $supplier = $this->resource;

        return [
            'id' => $supplier->id()->value(),
            'name' => $supplier->name(),
            'code' => $supplier->code(),
            'email' => $supplier->email()?->value(),
            'phone' => $supplier->phone()?->value(),
            'address' => $supplier->address(),
            'active' => $supplier->isActive(),
            'version' => $supplier->version(),
            'created_at' => $supplier->createdAt()->format('Y-m-d H:i:s'),
            'updated_at' => $supplier->updatedAt()->format('Y-m-d H:i:s'),
        ];
    }
}
