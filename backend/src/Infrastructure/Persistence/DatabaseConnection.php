<?php

declare(strict_types=1);

namespace TrackVault\Infrastructure\Persistence;

use PDO;
use PDOException;

/**
 * Database Connection Manager
 */
final class DatabaseConnection
{
    private static ?PDO $instance = null;
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function getConnection(): PDO
    {
        if (self::$instance === null) {
            $this->connect();
        }

        return self::$instance;
    }

    private function connect(): void
    {
        try {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                $this->config['host'],
                $this->config['port'],
                $this->config['name'],
                $this->config['charset']
            );

            self::$instance = new PDO(
                $dsn,
                $this->config['user'],
                $this->config['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_PERSISTENT => false,
                ]
            );
        } catch (PDOException $e) {
            throw new \RuntimeException('Database connection failed: ' . $e->getMessage());
        }
    }

    public function beginTransaction(): void
    {
        $this->getConnection()->beginTransaction();
    }

    public function commit(): void
    {
        $this->getConnection()->commit();
    }

    public function rollback(): void
    {
        $this->getConnection()->rollBack();
    }

    public function inTransaction(): bool
    {
        return $this->getConnection()->inTransaction();
    }
}
