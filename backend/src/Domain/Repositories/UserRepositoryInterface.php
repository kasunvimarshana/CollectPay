<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\User;
use Domain\ValueObjects\UserId;
use Domain\ValueObjects\Email;

/**
 * User Repository Interface
 */
interface UserRepositoryInterface
{
    public function save(User $user): void;
    
    public function findById(UserId $id): ?User;
    
    public function findByEmail(Email $email): ?User;
    
    public function findAll(int $page = 1, int $perPage = 20): array;
    
    public function delete(UserId $id): void;
    
    public function exists(UserId $id): bool;
}
