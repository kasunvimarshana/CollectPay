<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\User;
use App\Domain\Repositories\UserRepositoryInterface;
use PDO;

/**
 * MySQL User Repository Implementation
 */
class MySQLUserRepository extends BaseRepository implements UserRepositoryInterface
{
    protected string $table = 'users';

    /**
     * Find a user by ID
     */
    public function findById(int $id): ?User
    {
        $data = parent::findById($id);
        return $data ? $this->mapToEntity($data) : null;
    }

    /**
     * Find a user by email
     */
    public function findByEmail(string $email): ?User
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $data = $stmt->fetch();
        
        return $data ? $this->mapToEntity($data) : null;
    }

    /**
     * Get all users with optional filters
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 20): array
    {
        $conditions = [];
        
        if (isset($filters['is_active'])) {
            $conditions['is_active'] = $filters['is_active'];
        }
        
        if (isset($filters['role'])) {
            // Handle role filtering with JSON
            $sql = "SELECT * FROM {$this->table} WHERE JSON_CONTAINS(roles, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([json_encode($filters['role'])]);
            $results = $stmt->fetchAll();
        } else {
            $offset = ($page - 1) * $perPage;
            $results = parent::findAll($conditions, ['created_at' => 'DESC'], $perPage, $offset);
        }
        
        return array_map(fn($data) => $this->mapToEntity($data), $results);
    }

    /**
     * Save a new user
     */
    public function save(User $user): User
    {
        $data = [
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'password_hash' => $user->getPasswordHash(),
            'roles' => json_encode($user->getRoles()),
            'permissions' => json_encode($user->getPermissions()),
            'is_active' => $user->isActive() ? 1 : 0,
            'version' => $user->getVersion(),
            'created_at' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $user->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];
        
        $id = parent::create($data);
        $user->setId($id);
        
        return $user;
    }

    /**
     * Update an existing user
     */
    public function update(User $user): User
    {
        $data = [
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'password_hash' => $user->getPasswordHash(),
            'roles' => json_encode($user->getRoles()),
            'permissions' => json_encode($user->getPermissions()),
            'is_active' => $user->isActive() ? 1 : 0,
            'version' => $user->getVersion(),
            'updated_at' => $user->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];
        
        parent::update($user->getId(), $data);
        
        return $user;
    }

    /**
     * Delete a user
     */
    public function delete(int $id): bool
    {
        return parent::delete($id);
    }

    /**
     * Check if email already exists
     */
    public function emailExists(string $email): bool
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM {$this->table} WHERE email = ?");
        $stmt->execute([$email]);
        $result = $stmt->fetch();
        
        return ($result['count'] ?? 0) > 0;
    }

    /**
     * Map database row to User entity
     */
    private function mapToEntity(array $data): User
    {
        $user = new User(
            $data['name'],
            $data['email'],
            $data['password_hash'],
            json_decode($data['roles'], true),
            json_decode($data['permissions'], true),
            (bool) $data['is_active'],
            $data['id'],
            $data['version']
        );
        
        return $user;
    }
}
