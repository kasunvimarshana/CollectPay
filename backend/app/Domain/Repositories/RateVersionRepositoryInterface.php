<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\RateVersion;
use DateTimeImmutable;

interface RateVersionRepositoryInterface
{
    public function findById(string $id): ?RateVersion;
    
    public function findActiveRateForProduct(string $productId, DateTimeImmutable $date): ?RateVersion;
    
    public function findLatestRateForProduct(string $productId): ?RateVersion;
    
    public function findByProductId(string $productId): array;
    
    public function save(RateVersion $rateVersion): bool;
    
    public function delete(string $id): bool;
    
    public function getUpdatedSince(string $timestamp): array;
}
