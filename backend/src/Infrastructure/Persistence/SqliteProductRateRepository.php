<?php

namespace LedgerFlow\Infrastructure\Persistence;

use LedgerFlow\Domain\Entities\ProductRate;
use LedgerFlow\Domain\Repositories\ProductRateRepositoryInterface;
use PDO;

class SqliteProductRateRepository implements ProductRateRepositoryInterface
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(string $id): ?ProductRate
    {
        $stmt = $this->db->prepare('SELECT * FROM product_rates WHERE id = :id AND deleted_at IS NULL');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function findByProductId(string $productId): array
    {
        $stmt = $this->db->prepare('
            SELECT * FROM product_rates 
            WHERE product_id = :product_id AND deleted_at IS NULL 
            ORDER BY effective_date DESC
        ');
        $stmt->execute(['product_id' => $productId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function findCurrentRate(string $productId, string $date): ?ProductRate
    {
        $stmt = $this->db->prepare('
            SELECT * FROM product_rates 
            WHERE product_id = :product_id 
            AND effective_date <= :date 
            AND deleted_at IS NULL 
            ORDER BY effective_date DESC 
            LIMIT 1
        ');
        $stmt->execute([
            'product_id' => $productId,
            'date' => $date
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM product_rates WHERE deleted_at IS NULL ORDER BY effective_date DESC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function save(ProductRate $rate): bool
    {
        $existing = $this->findById($rate->getId());

        if ($existing) {
            return $this->update($rate);
        }

        return $this->insert($rate);
    }

    public function delete(string $id): bool
    {
        $stmt = $this->db->prepare('UPDATE product_rates SET deleted_at = :deleted_at WHERE id = :id');
        return $stmt->execute([
            'id' => $id,
            'deleted_at' => date('Y-m-d H:i:s')
        ]);
    }

    private function insert(ProductRate $rate): bool
    {
        $stmt = $this->db->prepare('
            INSERT INTO product_rates (id, product_id, rate, effective_date, created_at, updated_at, version)
            VALUES (:id, :product_id, :rate, :effective_date, :created_at, :updated_at, :version)
        ');

        return $stmt->execute([
            'id' => $rate->getId(),
            'product_id' => $rate->getProductId(),
            'rate' => $rate->getRate(),
            'effective_date' => $rate->getEffectiveDate()->format('Y-m-d'),
            'created_at' => $rate->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $rate->getUpdatedAt()->format('Y-m-d H:i:s'),
            'version' => $rate->getVersion()
        ]);
    }

    private function update(ProductRate $rate): bool
    {
        $stmt = $this->db->prepare('
            UPDATE product_rates 
            SET product_id = :product_id, 
                rate = :rate, 
                effective_date = :effective_date, 
                updated_at = :updated_at, 
                version = :version
            WHERE id = :id AND version = :old_version
        ');

        $result = $stmt->execute([
            'id' => $rate->getId(),
            'product_id' => $rate->getProductId(),
            'rate' => $rate->getRate(),
            'effective_date' => $rate->getEffectiveDate()->format('Y-m-d'),
            'updated_at' => $rate->getUpdatedAt()->format('Y-m-d H:i:s'),
            'version' => $rate->getVersion(),
            'old_version' => $rate->getVersion() - 1
        ]);

        if (!$result || $stmt->rowCount() === 0) {
            throw new \RuntimeException('Concurrent update detected. Please retry.');
        }

        return true;
    }

    private function hydrate(array $row): ProductRate
    {
        $rate = new ProductRate(
            $row['id'],
            $row['product_id'],
            (float)$row['rate'],
            new \DateTime($row['effective_date'])
        );

        $rate->setCreatedAt(new \DateTime($row['created_at']));
        $rate->setUpdatedAt(new \DateTime($row['updated_at']));
        $rate->setVersion((int)$row['version']);

        return $rate;
    }
}
