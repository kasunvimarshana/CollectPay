<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\User;

interface UserRepositoryInterface
{
    public function findById(string $id): ?User;
    
    public function findByEmail(string $email): ?User;
    
    public function findAll(int $page = 1, int $perPage = 50): array;
    
    public function save(User $user): bool;
    
    public function delete(string $id): bool;
    
    public function existsByEmail(string $email): bool;
}
