<?php

namespace App\Application\UseCases\Product;

use App\Application\DTOs\ProductDTO;
use App\Domain\Entities\Product;
use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * Get Product Use Case
 */
class GetProductUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {}

    public function execute(int $id): ?ProductDTO
    {
        $product = $this->productRepository->findById($id);
        
        if (!$product) {
            return null;
        }

        return $this->entityToDTO($product);
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
