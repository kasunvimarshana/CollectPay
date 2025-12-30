<?php

declare(strict_types=1);

namespace LedgerFlow\Infrastructure\Persistence;

use LedgerFlow\Domain\Entities\Supplier;
use LedgerFlow\Domain\Repositories\SupplierRepositoryInterface;
use PDO;
use DateTimeImmutable;

/**
 * SQLite Supplier Repository Implementation
 * 
 * Implements the SupplierRepositoryInterface for SQLite database persistence.
 * Follows Clean Architecture principles with proper separation of concerns.
 */
class SqliteSupplierRepository implements SupplierRepositoryInterface
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?Supplier
    {
        $stmt = $this->db->prepare('SELECT * FROM suppliers WHERE id = :id AND deleted_at IS NULL');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function findByCode(string $code): ?Supplier
    {
        $stmt = $this->db->prepare('SELECT * FROM suppliers WHERE code = :code AND deleted_at IS NULL');
        $stmt->execute(['code' => $code]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function findAll(int $limit = 100, int $offset = 0): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM suppliers WHERE deleted_at IS NULL ORDER BY name ASC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function findActive(int $limit = 100, int $offset = 0): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM suppliers WHERE is_active = 1 AND deleted_at IS NULL 
             ORDER BY name ASC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function save(Supplier $supplier): Supplier
    {
        if ($supplier->getId() !== null) {
            $this->update($supplier);
            return $supplier;
        }

        return $this->insert($supplier);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('UPDATE suppliers SET deleted_at = :deleted_at WHERE id = :id');
        return $stmt->execute([
            'id' => $id,
            'deleted_at' => (new DateTimeImmutable())->format('Y-m-d H:i:s')
        ]);
    }

    public function exists(int $id): bool
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM suppliers WHERE id = :id AND deleted_at IS NULL');
        $stmt->execute(['id' => $id]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function codeExists(string $code, ?int $excludeId = null): bool
    {
        if ($excludeId !== null) {
            $stmt = $this->db->prepare(
                'SELECT COUNT(*) FROM suppliers WHERE code = :code AND id != :exclude_id AND deleted_at IS NULL'
            );
            $stmt->execute(['code' => $code, 'exclude_id' => $excludeId]);
        } else {
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM suppliers WHERE code = :code AND deleted_at IS NULL');
            $stmt->execute(['code' => $code]);
        }
        
        return (int)$stmt->fetchColumn() > 0;
    }

    private function insert(Supplier $supplier): Supplier
    {
        $stmt = $this->db->prepare('
            INSERT INTO suppliers (name, code, phone, email, address, notes, is_active, created_at, updated_at)
            VALUES (:name, :code, :phone, :email, :address, :notes, :is_active, :created_at, :updated_at)
        ');

        $stmt->execute([
            'name' => $supplier->getName(),
            'code' => $supplier->getCode(),
            'phone' => $supplier->getPhone(),
            'email' => $supplier->getEmail(),
            'address' => $supplier->getAddress(),
            'notes' => $supplier->getNotes(),
            'is_active' => $supplier->isActive() ? 1 : 0,
            'created_at' => $supplier->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $supplier->getUpdatedAt()->format('Y-m-d H:i:s')
        ]);

        $id = (int)$this->db->lastInsertId();
        
        // Return updated supplier with ID
        return new Supplier(
            $supplier->getName(),
            $supplier->getCode(),
            $supplier->getPhone(),
            $supplier->getEmail(),
            $supplier->getAddress(),
            $supplier->getNotes(),
            $supplier->isActive(),
            $id,
            $supplier->getCreatedAt(),
            $supplier->getUpdatedAt(),
            $supplier->getDeletedAt()
        );
    }

    private function update(Supplier $supplier): void
    {
        $stmt = $this->db->prepare('
            UPDATE suppliers 
            SET name = :name, 
                code = :code,
                phone = :phone, 
                email = :email, 
                address = :address,
                notes = :notes,
                is_active = :is_active,
                updated_at = :updated_at,
                deleted_at = :deleted_at
            WHERE id = :id
        ');

        $result = $stmt->execute([
            'id' => $supplier->getId(),
            'name' => $supplier->getName(),
            'code' => $supplier->getCode(),
            'phone' => $supplier->getPhone(),
            'email' => $supplier->getEmail(),
            'address' => $supplier->getAddress(),
            'notes' => $supplier->getNotes(),
            'is_active' => $supplier->isActive() ? 1 : 0,
            'updated_at' => (new DateTimeImmutable())->format('Y-m-d H:i:s'),
            'deleted_at' => $supplier->getDeletedAt()?->format('Y-m-d H:i:s')
        ]);

        if (!$result) {
            throw new \RuntimeException('Failed to update supplier');
        }
    }

    private function hydrate(array $row): Supplier
    {
        return new Supplier(
            $row['name'],
            $row['code'],
            $row['phone'],
            $row['email'],
            $row['address'],
            $row['notes'],
            (bool)$row['is_active'],
            (int)$row['id'],
            new DateTimeImmutable($row['created_at']),
            new DateTimeImmutable($row['updated_at']),
            $row['deleted_at'] ? new DateTimeImmutable($row['deleted_at']) : null
        );
    }
}
