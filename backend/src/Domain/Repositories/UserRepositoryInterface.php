<?php

declare(strict_types=1);

namespace TrackVault\Domain\Repositories;

use TrackVault\Domain\Entities\User;
use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Email;

/**
 * User Repository Interface
 */
interface UserRepositoryInterface
{
    public function findById(UserId $id): ?User;
    
    public function findByEmail(Email $email): ?User;
    
    public function findAll(int $page = 1, int $perPage = 10): array;
    
    public function save(User $user): void;
    
    public function delete(UserId $id): void;
    
    public function exists(UserId $id): bool;
}
