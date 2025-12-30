<?php

declare(strict_types=1);

namespace Infrastructure\Repositories;

use Domain\Entities\User;
use Domain\Repositories\UserRepositoryInterface;
use Domain\ValueObjects\Email;
use App\Models\User as UserModel;

/**
 * Eloquent-based User Repository Implementation
 */
class UserRepository implements UserRepositoryInterface
{
    private function toDomainEntity(UserModel $model): User
    {
        $email = new Email($model->email);

        return User::create(
            id: $model->id,
            name: $model->name,
            email: $email,
            passwordHash: $model->password,
            roles: $model->roles ?? ['user']
        );
    }

    private function toModelData(User $user): array
    {
        return [
            'id' => $user->id(),
            'name' => $user->name(),
            'email' => $user->email()->value(),
            'password' => $user->passwordHash(),
            'roles' => $user->roles(),
            'is_active' => $user->isActive(),
        ];
    }

    public function findById(string $id): ?User
    {
        $model = UserModel::find($id);
        
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $model = UserModel::where('email', $email)->first();
        
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAll(int $page = 1, int $perPage = 20, array $filters = []): array
    {
        $query = UserModel::query();

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['role'])) {
            $query->whereJsonContains('roles', $filters['role']);
        }

        if (isset($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }

        $models = $query->orderBy('created_at', 'desc')
                       ->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $models->map(fn($model) => $this->toDomainEntity($model))->all(),
            'total' => $models->total(),
            'page' => $models->currentPage(),
            'per_page' => $models->perPage(),
            'last_page' => $models->lastPage(),
        ];
    }

    public function save(User $user): User
    {
        $data = $this->toModelData($user);
        
        UserModel::updateOrCreate(
            ['id' => $user->id()],
            $data
        );

        return $user;
    }

    public function delete(string $id): bool
    {
        $model = UserModel::find($id);
        
        if (!$model) {
            return false;
        }

        return $model->delete();
    }

    public function exists(string $id): bool
    {
        return UserModel::where('id', $id)->exists();
    }
}
