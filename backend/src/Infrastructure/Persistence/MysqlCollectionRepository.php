<?php

declare(strict_types=1);

namespace TrackVault\Infrastructure\Persistence;

use TrackVault\Domain\Entities\Collection;
use TrackVault\Domain\Repositories\CollectionRepositoryInterface;
use TrackVault\Domain\ValueObjects\CollectionId;
use TrackVault\Domain\ValueObjects\SupplierId;
use TrackVault\Domain\ValueObjects\ProductId;
use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Quantity;
use TrackVault\Domain\ValueObjects\Money;
use PDO;
use DateTimeImmutable;

/**
 * MySQL implementation of Collection Repository
 */
final class MysqlCollectionRepository implements CollectionRepositoryInterface
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function save(Collection $collection): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO collections (
                id, supplier_id, product_id, collector_id, quantity, unit,
                rate, currency, total_amount, collection_date, metadata,
                created_at, updated_at, deleted_at, version
            ) VALUES (
                :id, :supplier_id, :product_id, :collector_id, :quantity, :unit,
                :rate, :currency, :total_amount, :collection_date, :metadata,
                :created_at, :updated_at, :deleted_at, :version
            ) ON DUPLICATE KEY UPDATE
                supplier_id = VALUES(supplier_id),
                product_id = VALUES(product_id),
                collector_id = VALUES(collector_id),
                quantity = VALUES(quantity),
                unit = VALUES(unit),
                rate = VALUES(rate),
                currency = VALUES(currency),
                total_amount = VALUES(total_amount),
                collection_date = VALUES(collection_date),
                metadata = VALUES(metadata),
                updated_at = VALUES(updated_at),
                deleted_at = VALUES(deleted_at),
                version = VALUES(version)'
        );

        $data = $collection->toArray();
        $stmt->execute([
            ':id' => $data['id'],
            ':supplier_id' => $data['supplier_id'],
            ':product_id' => $data['product_id'],
            ':collector_id' => $data['collector_id'],
            ':quantity' => $data['quantity']['value'],
            ':unit' => $data['quantity']['unit'],
            ':rate' => $data['rate'],
            ':currency' => $data['total_amount']['currency'],
            ':total_amount' => $data['total_amount']['amount'],
            ':collection_date' => $data['collection_date'],
            ':metadata' => json_encode($data['metadata']),
            ':created_at' => $data['created_at'],
            ':updated_at' => $data['updated_at'],
            ':deleted_at' => $data['deleted_at'],
            ':version' => $data['version'],
        ]);
    }

    public function findById(CollectionId $id): ?Collection
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM collections WHERE id = :id AND deleted_at IS NULL LIMIT 1'
        );
        $stmt->execute([':id' => $id->toString()]);
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }

        return $this->hydrateCollection($row);
    }

    public function findBySupplierId(SupplierId $supplierId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM collections WHERE supplier_id = :supplier_id AND deleted_at IS NULL 
             ORDER BY collection_date DESC'
        );
        $stmt->execute([':supplier_id' => $supplierId->toString()]);
        
        $collections = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $collections[] = $this->hydrateCollection($row);
        }

        return $collections;
    }

    public function findAll(int $limit = 100, int $offset = 0): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM collections WHERE deleted_at IS NULL 
             ORDER BY collection_date DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $collections = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $collections[] = $this->hydrateCollection($row);
        }

        return $collections;
    }

    public function delete(CollectionId $id): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE collections SET deleted_at = NOW(), updated_at = NOW(), version = version + 1 
             WHERE id = :id'
        );
        $stmt->execute([':id' => $id->toString()]);
    }

    private function hydrateCollection(array $row): Collection
    {
        return new Collection(
            new CollectionId($row['id']),
            new SupplierId($row['supplier_id']),
            new ProductId($row['product_id']),
            new UserId($row['collector_id']),
            new Quantity((float)$row['quantity'], $row['unit']),
            (float)$row['rate'],
            new Money((float)$row['total_amount'], $row['currency']),
            new DateTimeImmutable($row['collection_date']),
            json_decode($row['metadata'], true) ?? [],
            new DateTimeImmutable($row['created_at']),
            new DateTimeImmutable($row['updated_at']),
            $row['deleted_at'] ? new DateTimeImmutable($row['deleted_at']) : null,
            (int)$row['version']
        );
    }
}
