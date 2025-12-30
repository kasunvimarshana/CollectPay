<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\User;
use Domain\ValueObjects\Email;

/**
 * User Repository Interface
 * 
 * Defines the contract for user persistence operations.
 */
interface UserRepositoryInterface
{
    public function findById(string $id): ?User;
    
    public function findByEmail(string $email): ?User;
    
    public function findAll(int $page = 1, int $perPage = 20, array $filters = []): array;
    
    public function save(User $user): User;
    
    public function delete(string $id): bool;
    
    public function exists(string $id): bool;
}
