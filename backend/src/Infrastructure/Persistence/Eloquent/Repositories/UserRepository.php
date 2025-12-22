<?php

namespace Infrastructure\Persistence\Eloquent\Repositories;

use Domain\User\User;
use Domain\User\UserRepositoryInterface;
use Domain\User\UserRole;
use Domain\Shared\ValueObjects\Email;
use Domain\Shared\ValueObjects\Uuid;
use Infrastructure\Persistence\Eloquent\Models\UserModel;

/**
 * Eloquent User Repository Implementation
 * Implements the Repository Pattern, converting between Domain Entities and Eloquent Models
 */
class UserRepository implements UserRepositoryInterface
{
    public function save(User $user): void
    {
        $model = UserModel::findOrNew($user->id()->value());
        
        $model->id = $user->id()->value();
        $model->name = $user->name();
        $model->email = $user->email()->value();
        $model->password = $user->passwordHash();
        $model->role = $user->role()->name();
        $model->is_active = $user->isActive();
        $model->last_login_at = $user->lastLoginAt();
        
        $model->save();
    }

    public function findById(string $id): ?User
    {
        $model = UserModel::find($id);
        
        return $model ? $this->toDomain($model) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $model = UserModel::where('email', $email)->first();
        
        return $model ? $this->toDomain($model) : null;
    }

    public function findAll(int $page = 1, int $perPage = 20): array
    {
        $models = UserModel::orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function delete(string $id): void
    {
        UserModel::where('id', $id)->delete();
    }

    public function exists(string $id): bool
    {
        return UserModel::where('id', $id)->exists();
    }

    public function emailExists(string $email): bool
    {
        return UserModel::where('email', $email)->exists();
    }

    public function countByRole(string $role): int
    {
        return UserModel::where('role', $role)->count();
    }

    private function toDomain(UserModel $model): User
    {
        return User::reconstitute(
            Uuid::fromString($model->id),
            $model->name,
            Email::fromString($model->email),
            $model->password,
            UserRole::fromString($model->role),
            $model->is_active,
            $model->created_at->toDateTimeImmutable(),
            $model->updated_at->toDateTimeImmutable(),
            $model->last_login_at?->toDateTimeImmutable()
        );
    }
}
