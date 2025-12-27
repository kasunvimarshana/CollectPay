<?php

declare(strict_types=1);

namespace TrackVault\Infrastructure\Persistence;

use TrackVault\Domain\Entities\Supplier;
use TrackVault\Domain\Repositories\SupplierRepositoryInterface;
use TrackVault\Domain\ValueObjects\SupplierId;
use PDO;
use DateTimeImmutable;

/**
 * MySQL implementation of Supplier Repository
 */
final class MysqlSupplierRepository implements SupplierRepositoryInterface
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function save(Supplier $supplier): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO suppliers (
                id, name, contact_person, phone, email, address,
                bank_account, tax_id, metadata, created_at, updated_at,
                deleted_at, version
            ) VALUES (
                :id, :name, :contact_person, :phone, :email, :address,
                :bank_account, :tax_id, :metadata, :created_at, :updated_at,
                :deleted_at, :version
            ) ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                contact_person = VALUES(contact_person),
                phone = VALUES(phone),
                email = VALUES(email),
                address = VALUES(address),
                bank_account = VALUES(bank_account),
                tax_id = VALUES(tax_id),
                metadata = VALUES(metadata),
                updated_at = VALUES(updated_at),
                deleted_at = VALUES(deleted_at),
                version = VALUES(version)'
        );

        $data = $supplier->toArray();
        $stmt->execute([
            ':id' => $data['id'],
            ':name' => $data['name'],
            ':contact_person' => $data['contact_person'],
            ':phone' => $data['phone'],
            ':email' => $data['email'],
            ':address' => $data['address'],
            ':bank_account' => $data['bank_account'],
            ':tax_id' => $data['tax_id'],
            ':metadata' => json_encode($data['metadata']),
            ':created_at' => $data['created_at'],
            ':updated_at' => $data['updated_at'],
            ':deleted_at' => $data['deleted_at'],
            ':version' => $data['version'],
        ]);
    }

    public function findById(SupplierId $id): ?Supplier
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM suppliers WHERE id = :id AND deleted_at IS NULL LIMIT 1'
        );
        $stmt->execute([':id' => $id->toString()]);
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }

        return $this->hydrateSupplier($row);
    }

    public function findAll(int $limit = 100, int $offset = 0): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM suppliers WHERE deleted_at IS NULL 
             ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $suppliers = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $suppliers[] = $this->hydrateSupplier($row);
        }

        return $suppliers;
    }

    public function delete(SupplierId $id): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE suppliers SET deleted_at = NOW(), updated_at = NOW(), version = version + 1 
             WHERE id = :id'
        );
        $stmt->execute([':id' => $id->toString()]);
    }

    private function hydrateSupplier(array $row): Supplier
    {
        return new Supplier(
            new SupplierId($row['id']),
            $row['name'],
            $row['contact_person'],
            $row['phone'],
            $row['email'],
            $row['address'],
            $row['bank_account'],
            $row['tax_id'],
            json_decode($row['metadata'], true) ?? [],
            new DateTimeImmutable($row['created_at']),
            new DateTimeImmutable($row['updated_at']),
            $row['deleted_at'] ? new DateTimeImmutable($row['deleted_at']) : null,
            (int)$row['version']
        );
    }
}
