<?php

namespace App\Infrastructure\Database;

use PDO;
use PDOException;

/**
 * Database Connection Handler
 * Provides a singleton database connection for the application
 */
class DatabaseConnection
{
    private static ?PDO $connection = null;
    private static array $config = [];

    /**
     * Initialize database configuration
     *
     * @param array $config Database configuration
     */
    public static function init(array $config): void
    {
        self::$config = $config;
    }

    /**
     * Get database connection instance
     *
     * @return PDO
     * @throws PDOException
     */
    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            self::$connection = self::createConnection();
        }

        return self::$connection;
    }

    /**
     * Create new database connection
     *
     * @return PDO
     * @throws PDOException
     */
    private static function createConnection(): PDO
    {
        $host = self::$config['host'] ?? 'localhost';
        $port = self::$config['port'] ?? 3306;
        $database = self::$config['database'] ?? 'paymaster';
        $username = self::$config['username'] ?? 'root';
        $password = self::$config['password'] ?? '';
        $charset = self::$config['charset'] ?? 'utf8mb4';

        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset={$charset}";

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => false,
        ];

        try {
            return new PDO($dsn, $username, $password, $options);
        } catch (PDOException $e) {
            throw new PDOException(
                "Database connection failed: " . $e->getMessage(),
                (int) $e->getCode()
            );
        }
    }

    /**
     * Close database connection
     */
    public static function close(): void
    {
        self::$connection = null;
    }

    /**
     * Begin database transaction
     */
    public static function beginTransaction(): void
    {
        self::getConnection()->beginTransaction();
    }

    /**
     * Commit database transaction
     */
    public static function commit(): void
    {
        self::getConnection()->commit();
    }

    /**
     * Rollback database transaction
     */
    public static function rollback(): void
    {
        self::getConnection()->rollBack();
    }

    /**
     * Check if in transaction
     *
     * @return bool
     */
    public static function inTransaction(): bool
    {
        return self::getConnection()->inTransaction();
    }
}
