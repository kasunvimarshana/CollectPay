<?php

declare(strict_types=1);

namespace TrackVault\Infrastructure\Persistence;

use TrackVault\Domain\Entities\Product;
use TrackVault\Domain\Repositories\ProductRepositoryInterface;
use TrackVault\Domain\ValueObjects\ProductId;
use PDO;
use DateTimeImmutable;

/**
 * MySQL implementation of Product Repository
 */
final class MysqlProductRepository implements ProductRepositoryInterface
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function save(Product $product): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO products (
                id, name, description, unit, rates, metadata,
                created_at, updated_at, deleted_at, version
            ) VALUES (
                :id, :name, :description, :unit, :rates, :metadata,
                :created_at, :updated_at, :deleted_at, :version
            ) ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                description = VALUES(description),
                unit = VALUES(unit),
                rates = VALUES(rates),
                metadata = VALUES(metadata),
                updated_at = VALUES(updated_at),
                deleted_at = VALUES(deleted_at),
                version = VALUES(version)'
        );

        $data = $product->toArray();
        $stmt->execute([
            ':id' => $data['id'],
            ':name' => $data['name'],
            ':description' => $data['description'],
            ':unit' => $data['unit'],
            ':rates' => json_encode($data['rates']),
            ':metadata' => json_encode($data['metadata']),
            ':created_at' => $data['created_at'],
            ':updated_at' => $data['updated_at'],
            ':deleted_at' => $data['deleted_at'],
            ':version' => $data['version'],
        ]);
    }

    public function findById(ProductId $id): ?Product
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM products WHERE id = :id AND deleted_at IS NULL LIMIT 1'
        );
        $stmt->execute([':id' => $id->toString()]);
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }

        return $this->hydrateProduct($row);
    }

    public function findAll(int $limit = 100, int $offset = 0): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM products WHERE deleted_at IS NULL 
             ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $products = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $products[] = $this->hydrateProduct($row);
        }

        return $products;
    }

    public function delete(ProductId $id): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE products SET deleted_at = NOW(), updated_at = NOW(), version = version + 1 
             WHERE id = :id'
        );
        $stmt->execute([':id' => $id->toString()]);
    }

    private function hydrateProduct(array $row): Product
    {
        return new Product(
            new ProductId($row['id']),
            $row['name'],
            $row['description'],
            $row['unit'],
            json_decode($row['rates'], true) ?? [],
            json_decode($row['metadata'], true) ?? [],
            new DateTimeImmutable($row['created_at']),
            new DateTimeImmutable($row['updated_at']),
            $row['deleted_at'] ? new DateTimeImmutable($row['deleted_at']) : null,
            (int)$row['version']
        );
    }
}
