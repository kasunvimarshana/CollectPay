<?php

declare(strict_types=1);

namespace TrackVault\Infrastructure\Persistence;

use TrackVault\Domain\Entities\Payment;
use TrackVault\Domain\Repositories\PaymentRepositoryInterface;
use TrackVault\Domain\ValueObjects\PaymentId;
use TrackVault\Domain\ValueObjects\SupplierId;
use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Money;
use PDO;
use DateTimeImmutable;

/**
 * MySQL implementation of Payment Repository
 */
final class MysqlPaymentRepository implements PaymentRepositoryInterface
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function save(Payment $payment): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO payments (
                id, supplier_id, processed_by, amount, currency, type,
                payment_method, reference, payment_date, metadata,
                created_at, updated_at, deleted_at, version
            ) VALUES (
                :id, :supplier_id, :processed_by, :amount, :currency, :type,
                :payment_method, :reference, :payment_date, :metadata,
                :created_at, :updated_at, :deleted_at, :version
            ) ON DUPLICATE KEY UPDATE
                supplier_id = VALUES(supplier_id),
                processed_by = VALUES(processed_by),
                amount = VALUES(amount),
                currency = VALUES(currency),
                type = VALUES(type),
                payment_method = VALUES(payment_method),
                reference = VALUES(reference),
                payment_date = VALUES(payment_date),
                metadata = VALUES(metadata),
                updated_at = VALUES(updated_at),
                deleted_at = VALUES(deleted_at),
                version = VALUES(version)'
        );

        $data = $payment->toArray();
        $stmt->execute([
            ':id' => $data['id'],
            ':supplier_id' => $data['supplier_id'],
            ':processed_by' => $data['processed_by'],
            ':amount' => $data['amount']['amount'],
            ':currency' => $data['amount']['currency'],
            ':type' => $data['type'],
            ':payment_method' => $data['payment_method'],
            ':reference' => $data['reference'],
            ':payment_date' => $data['payment_date'],
            ':metadata' => json_encode($data['metadata']),
            ':created_at' => $data['created_at'],
            ':updated_at' => $data['updated_at'],
            ':deleted_at' => $data['deleted_at'],
            ':version' => $data['version'],
        ]);
    }

    public function findById(PaymentId $id): ?Payment
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM payments WHERE id = :id AND deleted_at IS NULL LIMIT 1'
        );
        $stmt->execute([':id' => $id->toString()]);
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }

        return $this->hydratePayment($row);
    }

    public function findBySupplierId(SupplierId $supplierId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM payments WHERE supplier_id = :supplier_id AND deleted_at IS NULL 
             ORDER BY payment_date DESC'
        );
        $stmt->execute([':supplier_id' => $supplierId->toString()]);
        
        $payments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $payments[] = $this->hydratePayment($row);
        }

        return $payments;
    }

    public function findAll(int $limit = 100, int $offset = 0): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM payments WHERE deleted_at IS NULL 
             ORDER BY payment_date DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $payments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $payments[] = $this->hydratePayment($row);
        }

        return $payments;
    }

    public function delete(PaymentId $id): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE payments SET deleted_at = NOW(), updated_at = NOW(), version = version + 1 
             WHERE id = :id'
        );
        $stmt->execute([':id' => $id->toString()]);
    }

    private function hydratePayment(array $row): Payment
    {
        return new Payment(
            new PaymentId($row['id']),
            new SupplierId($row['supplier_id']),
            new UserId($row['processed_by']),
            new Money((float)$row['amount'], $row['currency']),
            $row['type'],
            $row['payment_method'],
            $row['reference'],
            new DateTimeImmutable($row['payment_date']),
            json_decode($row['metadata'], true) ?? [],
            new DateTimeImmutable($row['created_at']),
            new DateTimeImmutable($row['updated_at']),
            $row['deleted_at'] ? new DateTimeImmutable($row['deleted_at']) : null,
            (int)$row['version']
        );
    }
}
