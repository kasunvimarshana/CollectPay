<?php

declare(strict_types=1);

namespace LedgerFlow\Infrastructure\Persistence;

use LedgerFlow\Domain\Entities\User;
use LedgerFlow\Domain\Repositories\UserRepositoryInterface;
use PDO;
use DateTimeImmutable;

/**
 * SQLite User Repository Implementation
 * 
 * Implements the UserRepositoryInterface for SQLite database persistence.
 * Follows Clean Architecture principles with proper separation of concerns.
 */
class SqliteUserRepository implements UserRepositoryInterface
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?User
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = :id AND deleted_at IS NULL');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = :email AND deleted_at IS NULL');
        $stmt->execute(['email' => $email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->hydrate($row) : null;
    }

    public function findAll(int $limit = 100, int $offset = 0): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function findByRole(string $role, int $limit = 100, int $offset = 0): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM users WHERE role = :role AND deleted_at IS NULL 
             ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':role', $role, PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'hydrate'], $rows);
    }

    public function save(User $user): User
    {
        if ($user->getId() !== null) {
            $this->update($user);
            return $user;
        }

        return $this->insert($user);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('UPDATE users SET deleted_at = :deleted_at WHERE id = :id');
        return $stmt->execute([
            'id' => $id,
            'deleted_at' => (new DateTimeImmutable())->format('Y-m-d H:i:s')
        ]);
    }

    public function exists(int $id): bool
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM users WHERE id = :id AND deleted_at IS NULL');
        $stmt->execute(['id' => $id]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function emailExists(string $email, ?int $excludeId = null): bool
    {
        if ($excludeId !== null) {
            $stmt = $this->db->prepare(
                'SELECT COUNT(*) FROM users WHERE email = :email AND id != :exclude_id AND deleted_at IS NULL'
            );
            $stmt->execute(['email' => $email, 'exclude_id' => $excludeId]);
        } else {
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM users WHERE email = :email AND deleted_at IS NULL');
            $stmt->execute(['email' => $email]);
        }
        
        return (int)$stmt->fetchColumn() > 0;
    }

    private function insert(User $user): User
    {
        $stmt = $this->db->prepare('
            INSERT INTO users (name, email, password_hash, role, is_active, created_at, updated_at)
            VALUES (:name, :email, :password_hash, :role, :is_active, :created_at, :updated_at)
        ');

        $stmt->execute([
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'password_hash' => $user->getPasswordHash(),
            'role' => $user->getRole(),
            'is_active' => $user->isActive() ? 1 : 0,
            'created_at' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $user->getUpdatedAt()->format('Y-m-d H:i:s')
        ]);

        $id = (int)$this->db->lastInsertId();
        
        // Return updated user with ID
        return new User(
            $user->getName(),
            $user->getEmail(),
            $user->getPasswordHash(),
            $user->getRole(),
            $user->isActive(),
            $id,
            $user->getCreatedAt(),
            $user->getUpdatedAt(),
            $user->getDeletedAt()
        );
    }

    private function update(User $user): void
    {
        $stmt = $this->db->prepare('
            UPDATE users 
            SET name = :name,
                email = :email, 
                password_hash = :password_hash, 
                role = :role,
                is_active = :is_active,
                updated_at = :updated_at
            WHERE id = :id
        ');

        $result = $stmt->execute([
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'password_hash' => $user->getPasswordHash(),
            'role' => $user->getRole(),
            'is_active' => $user->isActive() ? 1 : 0,
            'updated_at' => (new DateTimeImmutable())->format('Y-m-d H:i:s')
        ]);

        if (!$result) {
            throw new \RuntimeException('Failed to update user');
        }
    }

    private function hydrate(array $row): User
    {
        return new User(
            $row['name'],
            $row['email'],
            $row['password_hash'],
            $row['role'],
            (bool)$row['is_active'],
            (int)$row['id'],
            new DateTimeImmutable($row['created_at']),
            new DateTimeImmutable($row['updated_at']),
            $row['deleted_at'] ? new DateTimeImmutable($row['deleted_at']) : null
        );
    }
}
