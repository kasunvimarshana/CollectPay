<?php

declare(strict_types=1);

namespace Application\UseCases\Product;

use Application\DTOs\CreateProductDTO;
use Domain\Entities\Product;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\ValueObjects\Unit;

/**
 * Use Case: Create a new product
 */
final class CreateProductUseCase
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param CreateProductDTO $dto
     * @return Product
     */
    public function execute(CreateProductDTO $dto): Product
    {
        // Validate unit
        $unit = new Unit($dto->defaultUnit);

        // Generate UUID for product
        $id = \Illuminate\Support\Str::uuid()->toString();

        // Create product entity
        $product = Product::create(
            id: $id,
            name: $dto->name,
            description: $dto->description ?? '',
            defaultUnit: $unit,
            metadata: $dto->metadata
        );

        // Persist product
        return $this->productRepository->save($product);
    }
}
