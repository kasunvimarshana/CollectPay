<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\UserEntity;
use App\Domain\Repositories\UserRepositoryInterface;
use App\Models\User;

/**
 * Eloquent User Repository
 * 
 * Implements user repository using Laravel Eloquent ORM.
 */
class EloquentUserRepository implements UserRepositoryInterface
{
    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?UserEntity
    {
        $model = User::where('email', $email)->first();

        return $model ? $this->toEntity($model) : null;
    }

    /**
     * Save a user entity
     */
    public function save(UserEntity $user): UserEntity
    {
        if ($user->getId()) {
            // Update existing
            $model = User::findOrFail($user->getId());
            $model->update($this->toArray($user));
        } else {
            // Create new
            $model = User::create($this->toArray($user));
        }

        return $this->toEntity($model);
    }

    /**
     * Find user by ID
     */
    public function findById(int $id): ?UserEntity
    {
        $model = User::find($id);

        return $model ? $this->toEntity($model) : null;
    }

    /**
     * Convert Eloquent model to domain entity
     */
    private function toEntity(User $model): UserEntity
    {
        return new UserEntity(
            id: $model->id,
            name: $model->name,
            email: $model->email,
            password: $model->password,
            role: $model->role ?? 'collector',
            isActive: $model->is_active ?? true,
            permissions: $model->permissions,
            version: $model->version ?? 1
        );
    }

    /**
     * Convert entity to array for Eloquent
     */
    private function toArray(UserEntity $user): array
    {
        $data = [
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'password' => $user->getPassword(), // Already hashed
            'role' => $user->getRole(),
            'is_active' => $user->isActive(),
            'permissions' => $user->getPermissions(),
            'version' => $user->getVersion(),
        ];

        if ($user->getId()) {
            $data['id'] = $user->getId();
        }

        return $data;
    }
}
