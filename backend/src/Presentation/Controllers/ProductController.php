<?php

declare(strict_types=1);

namespace TrackVault\Presentation\Controllers;

use TrackVault\Domain\Repositories\ProductRepositoryInterface;
use TrackVault\Domain\Entities\Product;
use TrackVault\Domain\ValueObjects\ProductId;
use Exception;

/**
 * Product Controller
 * 
 * Handles product CRUD operations
 */
final class ProductController extends BaseController
{
    private ProductRepositoryInterface $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public function index(): void
    {
        try {
            $limit = (int)($_GET['limit'] ?? 100);
            $offset = (int)($_GET['offset'] ?? 0);
            
            $products = $this->productRepository->findAll($limit, $offset);
            
            $data = array_map(fn($product) => $product->toArray(), $products);
            
            $this->successResponse($data);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'FETCH_FAILED', 500);
        }
    }

    public function show(string $id): void
    {
        try {
            $product = $this->productRepository->findById(new ProductId($id));
            
            if (!$product) {
                $this->errorResponse('Product not found', 'NOT_FOUND', 404);
                return;
            }
            
            $this->successResponse($product->toArray());
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'FETCH_FAILED', 500);
        }
    }

    public function store(): void
    {
        try {
            $data = $this->getRequestBody();
            
            // Validation
            $required = ['name', 'description', 'unit'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    $this->errorResponse("Field '{$field}' is required", 'VALIDATION_ERROR', 400);
                    return;
                }
            }

            $product = new Product(
                ProductId::generate(),
                $data['name'],
                $data['description'],
                $data['unit'],
                $data['rates'] ?? [],
                $data['metadata'] ?? []
            );

            $this->productRepository->save($product);
            
            $this->successResponse($product->toArray(), 'Product created successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'CREATE_FAILED', 400);
        }
    }

    public function update(string $id): void
    {
        try {
            $product = $this->productRepository->findById(new ProductId($id));
            
            if (!$product) {
                $this->errorResponse('Product not found', 'NOT_FOUND', 404);
                return;
            }

            $data = $this->getRequestBody();
            
            // Update product with new data
            $updatedProduct = new Product(
                $product->getId(),
                $data['name'] ?? $product->getName(),
                $data['description'] ?? $product->getDescription(),
                $data['unit'] ?? $product->getUnit(),
                $data['rates'] ?? $product->getRates(),
                $data['metadata'] ?? $product->getMetadata(),
                $product->getCreatedAt(),
                new \DateTimeImmutable(),
                null,
                $product->getVersion() + 1
            );

            $this->productRepository->save($updatedProduct);
            
            $this->successResponse($updatedProduct->toArray(), 'Product updated successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'UPDATE_FAILED', 400);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $product = $this->productRepository->findById(new ProductId($id));
            
            if (!$product) {
                $this->errorResponse('Product not found', 'NOT_FOUND', 404);
                return;
            }

            $this->productRepository->delete(new ProductId($id));
            
            $this->successResponse(null, 'Product deleted successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'DELETE_FAILED', 400);
        }
    }
}
