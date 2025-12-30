<?php

declare(strict_types=1);

namespace Application\UseCases\Product;

use Domain\Entities\Product;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\Services\UuidGeneratorInterface;
use Domain\ValueObjects\Unit;
use Application\DTOs\CreateProductDTO;

/**
 * Create Product Use Case
 * Handles the business logic for creating a new product
 */
final class CreateProductUseCase
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository,
        private readonly UuidGeneratorInterface $uuidGenerator
    ) {}

    public function execute(CreateProductDTO $dto): Product
    {
        // Check if product code already exists
        $existingProduct = $this->productRepository->findByCode($dto->code);
        if ($existingProduct) {
            throw new \DomainException("Product with code '{$dto->code}' already exists");
        }

        // Validate unit
        $unit = Unit::fromString($dto->defaultUnit);

        // Generate UUID for new product
        $id = $this->uuidGenerator->generate();

        // Create new product entity
        $product = Product::create(
            $id,
            $dto->name,
            $dto->code,
            $unit,
            $dto->description
        );

        // Persist to repository
        $this->productRepository->save($product);

        return $product;
    }
}
