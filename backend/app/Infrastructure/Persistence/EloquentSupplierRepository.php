<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Entities\SupplierEntity;
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Models\Collection;
use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

/**
 * Eloquent Supplier Repository
 *
 * Infrastructure implementation of the SupplierRepositoryInterface.
 * Bridges the domain layer with Laravel's Eloquent ORM.
 * This follows the Repository Pattern and Dependency Inversion Principle.
 */
class EloquentSupplierRepository implements SupplierRepositoryInterface
{
    /**
     * Convert Eloquent model to Domain entity
     */
    private function toDomainEntity(Supplier $model): SupplierEntity
    {
        return new SupplierEntity(
            name: $model->name,
            code: $model->code,
            contactPerson: $model->contact_person,
            phone: $model->phone,
            email: $model->email,
            address: $model->address,
            city: $model->city,
            state: $model->state,
            country: $model->country,
            postalCode: $model->postal_code,
            status: $model->status,
            version: $model->version ?? 1,
            id: $model->id,
            createdAt: $model->created_at,
            updatedAt: $model->updated_at
        );
    }

    /**
     * Convert Domain entity to Eloquent model attributes
     */
    private function toModelAttributes(SupplierEntity $entity): array
    {
        return [
            'name' => $entity->getName(),
            'code' => $entity->getCode(),
            'contact_person' => $entity->getContactPerson(),
            'phone' => $entity->getPhone(),
            'email' => $entity->getEmail(),
            'address' => $entity->getAddress(),
            'city' => $entity->getCity(),
            'state' => $entity->getState(),
            'country' => $entity->getCountry(),
            'postal_code' => $entity->getPostalCode(),
            'status' => $entity->getStatus(),
            'version' => $entity->getVersion(),
        ];
    }

    public function findById(int $id): ?SupplierEntity
    {
        $model = Supplier::find($id);

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByCode(string $code): ?SupplierEntity
    {
        $model = Supplier::where('code', $code)->first();

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function getAll(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = Supplier::query();

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => array_map(
                fn ($model) => $this->toDomainEntity($model),
                $paginator->items()
            ),
            'total' => $paginator->total(),
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'last_page' => $paginator->lastPage(),
        ];
    }

    public function save(SupplierEntity $entity): SupplierEntity
    {
        $attributes = $this->toModelAttributes($entity);

        if ($entity->getId() === null) {
            // Create new
            $model = Supplier::create($attributes);
        } else {
            // Update existing
            $model = Supplier::findOrFail($entity->getId());
            $model->update($attributes);
            $model->refresh();
        }

        return $this->toDomainEntity($model);
    }

    public function delete(int $id): bool
    {
        $model = Supplier::findOrFail($id);

        return $model->delete();
    }

    public function exists(int $id): bool
    {
        return Supplier::where('id', $id)->exists();
    }

    public function isCodeUnique(string $code, ?int $excludeId = null): bool
    {
        $query = Supplier::where('code', $code);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return ! $query->exists();
    }

    public function getBalance(int $id): array
    {
        // Calculate total collections
        $totalCollections = Collection::where('supplier_id', $id)
            ->sum(DB::raw('quantity * rate'));

        // Calculate total payments
        $totalPayments = Payment::where('supplier_id', $id)
            ->sum('amount');

        return [
            'supplier_id' => $id,
            'total_collections' => (float) $totalCollections,
            'total_payments' => (float) $totalPayments,
            'outstanding_balance' => (float) ($totalCollections - $totalPayments),
        ];
    }

    public function getCollections(int $id, array $filters = []): array
    {
        $query = Collection::where('supplier_id', $id)
            ->with(['product', 'collector']);

        if (isset($filters['date_from'])) {
            $query->where('collection_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('collection_date', '<=', $filters['date_to']);
        }

        return $query->orderBy('collection_date', 'desc')->get()->toArray();
    }

    public function getPayments(int $id, array $filters = []): array
    {
        $query = Payment::where('supplier_id', $id);

        if (isset($filters['date_from'])) {
            $query->where('payment_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('payment_date', '<=', $filters['date_to']);
        }

        return $query->orderBy('payment_date', 'desc')->get()->toArray();
    }
}
