<?php

namespace LedgerFlow\Infrastructure\Persistence;

use LedgerFlow\Domain\Entities\Payment;
use LedgerFlow\Domain\Repositories\PaymentRepositoryInterface;
use PDO;

class SqlitePaymentRepository implements PaymentRepositoryInterface
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(string $id): ?Payment
    {
        $stmt = $this->db->prepare('SELECT * FROM payments WHERE id = :id AND deleted_at IS NULL');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function findBySupplierId(string $supplierId): array
    {
        $stmt = $this->db->prepare('
            SELECT * FROM payments 
            WHERE supplier_id = :supplier_id AND deleted_at IS NULL 
            ORDER BY payment_date DESC
        ');
        $stmt->execute(['supplier_id' => $supplierId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM payments WHERE deleted_at IS NULL ORDER BY payment_date DESC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function save(Payment $payment): bool
    {
        $existing = $this->findById($payment->getId());

        if ($existing) {
            return $this->update($payment);
        }

        return $this->insert($payment);
    }

    public function delete(string $id): bool
    {
        $stmt = $this->db->prepare('UPDATE payments SET deleted_at = :deleted_at WHERE id = :id');
        return $stmt->execute([
            'id' => $id,
            'deleted_at' => date('Y-m-d H:i:s')
        ]);
    }

    private function insert(Payment $payment): bool
    {
        $stmt = $this->db->prepare('
            INSERT INTO payments (
                id, supplier_id, amount, payment_date, payment_method, 
                reference, notes, paid_by, created_at, updated_at, version
            ) VALUES (
                :id, :supplier_id, :amount, :payment_date, :payment_method, 
                :reference, :notes, :paid_by, :created_at, :updated_at, :version
            )
        ');

        return $stmt->execute([
            'id' => $payment->getId(),
            'supplier_id' => $payment->getSupplierId(),
            'amount' => $payment->getAmount(),
            'payment_date' => $payment->getPaymentDate()->format('Y-m-d'),
            'payment_method' => $payment->getPaymentMethod(),
            'reference' => $payment->getReference(),
            'notes' => $payment->getNotes(),
            'paid_by' => $payment->getPaidBy(),
            'created_at' => $payment->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $payment->getUpdatedAt()->format('Y-m-d H:i:s'),
            'version' => $payment->getVersion()
        ]);
    }

    private function update(Payment $payment): bool
    {
        $stmt = $this->db->prepare('
            UPDATE payments 
            SET supplier_id = :supplier_id, 
                amount = :amount, 
                payment_date = :payment_date, 
                payment_method = :payment_method, 
                reference = :reference, 
                notes = :notes, 
                paid_by = :paid_by, 
                updated_at = :updated_at, 
                version = :version
            WHERE id = :id AND version = :old_version
        ');

        $result = $stmt->execute([
            'id' => $payment->getId(),
            'supplier_id' => $payment->getSupplierId(),
            'amount' => $payment->getAmount(),
            'payment_date' => $payment->getPaymentDate()->format('Y-m-d'),
            'payment_method' => $payment->getPaymentMethod(),
            'reference' => $payment->getReference(),
            'notes' => $payment->getNotes(),
            'paid_by' => $payment->getPaidBy(),
            'updated_at' => $payment->getUpdatedAt()->format('Y-m-d H:i:s'),
            'version' => $payment->getVersion(),
            'old_version' => $payment->getVersion() - 1
        ]);

        if (!$result || $stmt->rowCount() === 0) {
            throw new \RuntimeException('Concurrent update detected. Please retry.');
        }

        return true;
    }

    private function hydrate(array $row): Payment
    {
        $payment = new Payment(
            $row['id'],
            $row['supplier_id'],
            (float)$row['amount'],
            new \DateTime($row['payment_date']),
            $row['payment_method'],
            $row['reference'],
            $row['notes'],
            $row['paid_by']
        );

        $payment->setCreatedAt(new \DateTime($row['created_at']));
        $payment->setUpdatedAt(new \DateTime($row['updated_at']));
        $payment->setVersion((int)$row['version']);

        return $payment;
    }
}
