<?php

namespace App\Application\UseCases\Product;

use App\Application\DTOs\ProductDTO;
use App\Domain\Entities\Product;
use App\Domain\Repositories\ProductRepositoryInterface;
use InvalidArgumentException;

/**
 * Create Product Use Case
 */
class CreateProductUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {}

    public function execute(ProductDTO $dto): ProductDTO
    {
        if ($this->productRepository->codeExists($dto->code)) {
            throw new InvalidArgumentException("Product code '{$dto->code}' already exists");
        }

        $product = new Product(
            name: $dto->name,
            code: $dto->code,
            unit: $dto->unit,
            description: $dto->description,
            isActive: $dto->isActive,
            createdBy: $dto->createdBy
        );

        $savedProduct = $this->productRepository->save($product);

        return $this->entityToDTO($savedProduct);
    }

    private function entityToDTO(Product $product): ProductDTO
    {
        return new ProductDTO(
            id: $product->getId(),
            name: $product->getName(),
            code: $product->getCode(),
            description: $product->getDescription(),
            unit: $product->getUnit(),
            isActive: $product->isActive(),
            createdBy: $product->getCreatedBy(),
            createdAt: $product->getCreatedAt()->format('Y-m-d H:i:s'),
            updatedAt: $product->getUpdatedAt()->format('Y-m-d H:i:s')
        );
    }
}
