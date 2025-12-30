<?php

namespace LedgerFlow\Application\UseCases;

use LedgerFlow\Domain\Entities\Product;
use LedgerFlow\Domain\Repositories\ProductRepositoryInterface;

class CreateProduct
{
    private ProductRepositoryInterface $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public function execute(array $data): Product
    {
        // Validate input
        $this->validate($data);

        // Create product entity
        $product = new Product(
            $this->generateId(),
            $data['name'],
            $data['description'] ?? null,
            $data['unit']
        );

        // Save to repository
        $this->productRepository->save($product);

        return $product;
    }

    private function validate(array $data): void
    {
        if (empty($data['name'])) {
            throw new \InvalidArgumentException('Product name is required');
        }

        if (empty($data['unit'])) {
            throw new \InvalidArgumentException('Unit is required');
        }
    }

    private function generateId(): string
    {
        return uniqid('product_', true);
    }
}
