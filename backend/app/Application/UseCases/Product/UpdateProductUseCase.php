<?php

namespace App\Application\UseCases\Product;

use App\Application\DTOs\ProductDTO;
use App\Domain\Entities\Product;
use App\Domain\Repositories\ProductRepositoryInterface;
use InvalidArgumentException;

/**
 * Update Product Use Case
 */
class UpdateProductUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {}

    public function execute(int $id, ProductDTO $dto): ProductDTO
    {
        $product = $this->productRepository->findById($id);
        
        if (!$product) {
            throw new InvalidArgumentException("Product with ID {$id} not found");
        }

        if ($dto->code !== $product->getCode() && 
            $this->productRepository->codeExists($dto->code, $id)) {
            throw new InvalidArgumentException("Product code '{$dto->code}' already exists");
        }

        $product->updateDetails(
            name: $dto->name,
            description: $dto->description
        );

        if ($dto->isActive && !$product->isActive()) {
            $product->activate();
        } elseif (!$dto->isActive && $product->isActive()) {
            $product->deactivate();
        }

        $updatedProduct = $this->productRepository->update($product);

        return $this->entityToDTO($updatedProduct);
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
