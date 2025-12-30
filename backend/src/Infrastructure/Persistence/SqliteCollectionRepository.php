<?php

namespace LedgerFlow\Infrastructure\Persistence;

use LedgerFlow\Domain\Entities\Collection;
use LedgerFlow\Domain\Repositories\CollectionRepositoryInterface;
use PDO;

class SqliteCollectionRepository implements CollectionRepositoryInterface
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(string $id): ?Collection
    {
        $stmt = $this->db->prepare('SELECT * FROM collections WHERE id = :id AND deleted_at IS NULL');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function findBySupplierId(string $supplierId): array
    {
        $stmt = $this->db->prepare('
            SELECT * FROM collections 
            WHERE supplier_id = :supplier_id AND deleted_at IS NULL 
            ORDER BY collection_date DESC
        ');
        $stmt->execute(['supplier_id' => $supplierId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function findBySupplierAndProduct(string $supplierId, string $productId): array
    {
        $stmt = $this->db->prepare('
            SELECT * FROM collections 
            WHERE supplier_id = :supplier_id 
            AND product_id = :product_id 
            AND deleted_at IS NULL 
            ORDER BY collection_date DESC
        ');
        $stmt->execute([
            'supplier_id' => $supplierId,
            'product_id' => $productId
        ]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM collections WHERE deleted_at IS NULL ORDER BY collection_date DESC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function save(Collection $collection): bool
    {
        $existing = $this->findById($collection->getId());

        if ($existing) {
            return $this->update($collection);
        }

        return $this->insert($collection);
    }

    public function delete(string $id): bool
    {
        $stmt = $this->db->prepare('UPDATE collections SET deleted_at = :deleted_at WHERE id = :id');
        return $stmt->execute([
            'id' => $id,
            'deleted_at' => date('Y-m-d H:i:s')
        ]);
    }

    private function insert(Collection $collection): bool
    {
        $stmt = $this->db->prepare('
            INSERT INTO collections (
                id, supplier_id, product_id, quantity, rate, total_amount, 
                collection_date, notes, collected_by, created_at, updated_at, version
            ) VALUES (
                :id, :supplier_id, :product_id, :quantity, :rate, :total_amount, 
                :collection_date, :notes, :collected_by, :created_at, :updated_at, :version
            )
        ');

        return $stmt->execute([
            'id' => $collection->getId(),
            'supplier_id' => $collection->getSupplierId(),
            'product_id' => $collection->getProductId(),
            'quantity' => $collection->getQuantity(),
            'rate' => $collection->getRate(),
            'total_amount' => $collection->getTotalAmount(),
            'collection_date' => $collection->getCollectionDate()->format('Y-m-d'),
            'notes' => $collection->getNotes(),
            'collected_by' => $collection->getCollectedBy(),
            'created_at' => $collection->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $collection->getUpdatedAt()->format('Y-m-d H:i:s'),
            'version' => $collection->getVersion()
        ]);
    }

    private function update(Collection $collection): bool
    {
        $stmt = $this->db->prepare('
            UPDATE collections 
            SET supplier_id = :supplier_id, 
                product_id = :product_id, 
                quantity = :quantity, 
                rate = :rate, 
                total_amount = :total_amount, 
                collection_date = :collection_date, 
                notes = :notes, 
                collected_by = :collected_by, 
                updated_at = :updated_at, 
                version = :version
            WHERE id = :id AND version = :old_version
        ');

        $result = $stmt->execute([
            'id' => $collection->getId(),
            'supplier_id' => $collection->getSupplierId(),
            'product_id' => $collection->getProductId(),
            'quantity' => $collection->getQuantity(),
            'rate' => $collection->getRate(),
            'total_amount' => $collection->getTotalAmount(),
            'collection_date' => $collection->getCollectionDate()->format('Y-m-d'),
            'notes' => $collection->getNotes(),
            'collected_by' => $collection->getCollectedBy(),
            'updated_at' => $collection->getUpdatedAt()->format('Y-m-d H:i:s'),
            'version' => $collection->getVersion(),
            'old_version' => $collection->getVersion() - 1
        ]);

        if (!$result || $stmt->rowCount() === 0) {
            throw new \RuntimeException('Concurrent update detected. Please retry.');
        }

        return true;
    }

    private function hydrate(array $row): Collection
    {
        $collection = new Collection(
            $row['id'],
            $row['supplier_id'],
            $row['product_id'],
            (float)$row['quantity'],
            (float)$row['rate'],
            new \DateTime($row['collection_date']),
            $row['notes'],
            $row['collected_by']
        );

        $collection->setCreatedAt(new \DateTime($row['created_at']));
        $collection->setUpdatedAt(new \DateTime($row['updated_at']));
        $collection->setVersion((int)$row['version']);

        return $collection;
    }
}
