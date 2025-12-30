<?php

namespace LedgerFlow\Infrastructure\Persistence;

use LedgerFlow\Domain\Entities\Product;
use LedgerFlow\Domain\Repositories\ProductRepositoryInterface;
use PDO;

class SqliteProductRepository implements ProductRepositoryInterface
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(string $id): ?Product
    {
        $stmt = $this->db->prepare('SELECT * FROM products WHERE id = :id AND deleted_at IS NULL');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM products WHERE deleted_at IS NULL ORDER BY name ASC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function save(Product $product): bool
    {
        $existing = $this->findById($product->getId());

        if ($existing) {
            return $this->update($product);
        }

        return $this->insert($product);
    }

    public function delete(string $id): bool
    {
        $stmt = $this->db->prepare('UPDATE products SET deleted_at = :deleted_at WHERE id = :id');
        return $stmt->execute([
            'id' => $id,
            'deleted_at' => date('Y-m-d H:i:s')
        ]);
    }

    private function insert(Product $product): bool
    {
        $stmt = $this->db->prepare('
            INSERT INTO products (id, name, description, unit, created_at, updated_at, version)
            VALUES (:id, :name, :description, :unit, :created_at, :updated_at, :version)
        ');

        return $stmt->execute([
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'unit' => $product->getUnit(),
            'created_at' => $product->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $product->getUpdatedAt()->format('Y-m-d H:i:s'),
            'version' => $product->getVersion()
        ]);
    }

    private function update(Product $product): bool
    {
        $stmt = $this->db->prepare('
            UPDATE products 
            SET name = :name, 
                description = :description, 
                unit = :unit, 
                updated_at = :updated_at, 
                version = :version
            WHERE id = :id AND version = :old_version
        ');

        $result = $stmt->execute([
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'unit' => $product->getUnit(),
            'updated_at' => $product->getUpdatedAt()->format('Y-m-d H:i:s'),
            'version' => $product->getVersion(),
            'old_version' => $product->getVersion() - 1
        ]);

        if (!$result || $stmt->rowCount() === 0) {
            throw new \RuntimeException('Concurrent update detected. Please retry.');
        }

        return true;
    }

    private function hydrate(array $row): Product
    {
        $product = new Product(
            $row['id'],
            $row['name'],
            $row['description'],
            $row['unit']
        );

        $product->setCreatedAt(new \DateTime($row['created_at']));
        $product->setUpdatedAt(new \DateTime($row['updated_at']));
        $product->setVersion((int)$row['version']);

        return $product;
    }
}
