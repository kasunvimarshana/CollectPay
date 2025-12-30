<?php

namespace App\Application\UseCases\Product;

use App\Application\DTOs\ProductDTO;
use App\Domain\Entities\Product;
use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * List Products Use Case
 */
class ListProductsUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {}

    public function execute(array $filters = [], int $page = 1, int $perPage = 50): array
    {
        $products = $this->productRepository->findAll($filters, $page, $perPage);
        $total = $this->productRepository->count($filters);

        return [
            'data' => array_map(
                fn($product) => $this->entityToDTO($product),
                $products
            ),
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage)
            ]
        ];
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
