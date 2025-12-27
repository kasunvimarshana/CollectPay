<?php

declare(strict_types=1);

namespace TrackVault\Infrastructure\Persistence;

use TrackVault\Domain\Entities\User;
use TrackVault\Domain\Repositories\UserRepositoryInterface;
use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Email;
use PDO;
use DateTimeImmutable;

/**
 * MySQL implementation of User Repository
 */
final class MysqlUserRepository implements UserRepositoryInterface
{
    private PDO $connection;

    public function __construct(DatabaseConnection $database)
    {
        $this->connection = $database->getConnection();
    }

    public function findById(UserId $id): ?User
    {
        $stmt = $this->connection->prepare(
            'SELECT * FROM users WHERE id = :id AND deleted_at IS NULL'
        );
        $stmt->execute(['id' => $id->toString()]);
        
        $row = $stmt->fetch();
        
        return $row ? $this->mapRowToEntity($row) : null;
    }

    public function findByEmail(Email $email): ?User
    {
        $stmt = $this->connection->prepare(
            'SELECT * FROM users WHERE email = :email AND deleted_at IS NULL'
        );
        $stmt->execute(['email' => $email->toString()]);
        
        $row = $stmt->fetch();
        
        return $row ? $this->mapRowToEntity($row) : null;
    }

    public function findAll(int $page = 1, int $perPage = 10): array
    {
        $offset = ($page - 1) * $perPage;
        
        $stmt = $this->connection->prepare(
            'SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $users = [];
        while ($row = $stmt->fetch()) {
            $users[] = $this->mapRowToEntity($row);
        }
        
        return $users;
    }

    public function save(User $user): void
    {
        if ($this->exists($user->getId())) {
            $this->update($user);
        } else {
            $this->insert($user);
        }
    }

    private function insert(User $user): void
    {
        $stmt = $this->connection->prepare(
            'INSERT INTO users (id, name, email, password_hash, roles, permissions, created_at, updated_at, version) 
             VALUES (:id, :name, :email, :password_hash, :roles, :permissions, :created_at, :updated_at, :version)'
        );
        
        $stmt->execute([
            'id' => $user->getId()->toString(),
            'name' => $user->getName(),
            'email' => $user->getEmail()->toString(),
            'password_hash' => $user->getPasswordHash(),
            'roles' => json_encode($user->getRoles()),
            'permissions' => json_encode($user->getPermissions()),
            'created_at' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $user->getUpdatedAt()->format('Y-m-d H:i:s'),
            'version' => $user->getVersion(),
        ]);
    }

    private function update(User $user): void
    {
        $stmt = $this->connection->prepare(
            'UPDATE users 
             SET name = :name, email = :email, password_hash = :password_hash, 
                 roles = :roles, permissions = :permissions, updated_at = :updated_at, 
                 version = :version
             WHERE id = :id AND version = :old_version'
        );
        
        $affected = $stmt->execute([
            'id' => $user->getId()->toString(),
            'name' => $user->getName(),
            'email' => $user->getEmail()->toString(),
            'password_hash' => $user->getPasswordHash(),
            'roles' => json_encode($user->getRoles()),
            'permissions' => json_encode($user->getPermissions()),
            'updated_at' => $user->getUpdatedAt()->format('Y-m-d H:i:s'),
            'version' => $user->getVersion(),
            'old_version' => $user->getVersion() - 1,
        ]);

        if ($stmt->rowCount() === 0) {
            throw new \RuntimeException('Optimistic locking conflict: User has been modified by another process');
        }
    }

    public function delete(UserId $id): void
    {
        $stmt = $this->connection->prepare(
            'UPDATE users SET deleted_at = :deleted_at WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id->toString(),
            'deleted_at' => (new DateTimeImmutable())->format('Y-m-d H:i:s'),
        ]);
    }

    public function exists(UserId $id): bool
    {
        $stmt = $this->connection->prepare(
            'SELECT COUNT(*) FROM users WHERE id = :id'
        );
        $stmt->execute(['id' => $id->toString()]);
        
        return $stmt->fetchColumn() > 0;
    }

    private function mapRowToEntity(array $row): User
    {
        return new User(
            new UserId($row['id']),
            $row['name'],
            new Email($row['email']),
            $row['password_hash'],
            json_decode($row['roles'], true),
            json_decode($row['permissions'], true),
            new DateTimeImmutable($row['created_at']),
            new DateTimeImmutable($row['updated_at']),
            $row['deleted_at'] ? new DateTimeImmutable($row['deleted_at']) : null,
            (int) $row['version']
        );
    }
}
