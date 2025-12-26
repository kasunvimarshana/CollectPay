<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\Supplier;
use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * MySQL Supplier Repository Implementation
 */
class MySQLSupplierRepository extends BaseRepository implements SupplierRepositoryInterface
{
    protected string $table = 'suppliers';

    public function findById(int $id): ?Supplier
    {
        $data = parent::findById($id);
        return $data ? $this->mapToEntity($data) : null;
    }

    public function findByCode(string $code): ?Supplier
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE code = ? LIMIT 1");
        $stmt->execute([$code]);
        $data = $stmt->fetch();
        
        return $data ? $this->mapToEntity($data) : null;
    }

    public function findAll(array $filters = [], int $page = 1, int $perPage = 20): array
    {
        $conditions = [];
        
        if (isset($filters['is_active'])) {
            $conditions['is_active'] = $filters['is_active'];
        }
        
        if (isset($filters['region'])) {
            $conditions['region'] = $filters['region'];
        }
        
        $offset = ($page - 1) * $perPage;
        $results = parent::findAll($conditions, ['name' => 'ASC'], $perPage, $offset);
        
        return array_map(fn($data) => $this->mapToEntity($data), $results);
    }

    public function save(Supplier $supplier): Supplier
    {
        $data = [
            'name' => $supplier->getName(),
            'code' => $supplier->getCode(),
            'phone' => $supplier->getPhone(),
            'address' => $supplier->getAddress(),
            'region' => $supplier->getRegion(),
            'notes' => $supplier->getNotes(),
            'is_active' => $supplier->isActive() ? 1 : 0,
            'version' => $supplier->getVersion(),
            'created_at' => $supplier->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $supplier->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];
        
        $id = parent::create($data);
        $supplier->setId($id);
        
        return $supplier;
    }

    public function update(Supplier $supplier): Supplier
    {
        $data = [
            'name' => $supplier->getName(),
            'code' => $supplier->getCode(),
            'phone' => $supplier->getPhone(),
            'address' => $supplier->getAddress(),
            'region' => $supplier->getRegion(),
            'notes' => $supplier->getNotes(),
            'is_active' => $supplier->isActive() ? 1 : 0,
            'version' => $supplier->getVersion(),
            'updated_at' => $supplier->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];
        
        parent::update($supplier->getId(), $data);
        
        return $supplier;
    }

    public function delete(int $id): bool
    {
        return parent::delete($id);
    }

    public function codeExists(string $code): bool
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM {$this->table} WHERE code = ?");
        $stmt->execute([$code]);
        $result = $stmt->fetch();
        
        return ($result['count'] ?? 0) > 0;
    }

    private function mapToEntity(array $data): Supplier
    {
        $supplier = new Supplier(
            $data['name'],
            $data['code'],
            $data['phone'],
            $data['address'],
            $data['region'],
            $data['notes'],
            (bool) $data['is_active'],
            $data['id'],
            $data['version']
        );
        
        return $supplier;
    }
}
