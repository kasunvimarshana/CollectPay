<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Entities\User;
use Domain\Repositories\UserRepositoryInterface;
use Domain\ValueObjects\UserId;
use Domain\ValueObjects\Email;
use App\Models\User as UserModel;
use DateTimeImmutable;

/**
 * Eloquent User Repository Implementation
 */
final class EloquentUserRepository implements UserRepositoryInterface
{
    public function save(User $user): void
    {
        $model = UserModel::find($user->getId()->toString()) ?? new UserModel();

        $model->fill([
            'id' => $user->getId()->toString(),
            'name' => $user->getName(),
            'email' => $user->getEmail()->toString(),
            'password' => $user->getPasswordHash(),
            'roles' => $user->getRoles(),
            'is_active' => $user->isActive(),
        ]);

        // Handle timestamps manually if needed
        if (!$model->exists) {
            $model->created_at = $user->getCreatedAt()->format('Y-m-d H:i:s');
        }
        $model->updated_at = $user->getUpdatedAt()->format('Y-m-d H:i:s');

        $model->save();
    }

    public function findById(UserId $id): ?User
    {
        $model = UserModel::find($id->toString());

        if (!$model) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findByEmail(Email $email): ?User
    {
        $model = UserModel::where('email', $email->toString())->first();

        if (!$model) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findAll(int $page = 1, int $perPage = 20): array
    {
        $models = UserModel::where('is_active', true)
            ->orderBy('name')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->toArray();
    }

    public function delete(UserId $id): void
    {
        $model = UserModel::find($id->toString());
        if ($model) {
            $model->delete();
        }
    }

    public function exists(UserId $id): bool
    {
        return UserModel::where('id', $id->toString())->exists();
    }

    private function toDomainEntity(UserModel $model): User
    {
        return User::reconstitute(
            UserId::fromString($model->id),
            $model->name,
            Email::fromString($model->email),
            $model->password,
            $model->roles ?? ['user'],
            (bool) $model->is_active,
            new DateTimeImmutable($model->created_at),
            new DateTimeImmutable($model->updated_at),
            $model->deleted_at ? new DateTimeImmutable($model->deleted_at) : null
        );
    }
}
