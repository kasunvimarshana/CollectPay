<?php

declare(strict_types=1);

namespace Presentation\Http\Controllers;

use Application\DTOs\CreateProductDTO;
use Application\DTOs\UpdateProductDTO;
use Application\UseCases\Product\CreateProductUseCase;
use Application\UseCases\Product\UpdateProductUseCase;
use Application\UseCases\Product\DeleteProductUseCase;
use Application\UseCases\Product\GetProductUseCase;
use Application\UseCases\Product\ListProductsUseCase;
use Application\UseCases\Product\AddProductRateUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Product Controller
 * 
 * Handles CRUD operations for products and product rate management.
 * Follows Clean Architecture by delegating all business logic to use cases.
 */
final class ProductController extends Controller
{
    public function __construct(
        private readonly CreateProductUseCase $createProduct,
        private readonly UpdateProductUseCase $updateProduct,
        private readonly DeleteProductUseCase $deleteProduct,
        private readonly GetProductUseCase $getProduct,
        private readonly ListProductsUseCase $listProducts,
        private readonly AddProductRateUseCase $addProductRate
    ) {}

    /**
     * List all products with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'is_active' => 'boolean',
            'search' => 'string|max:255',
        ]);

        try {
            $result = $this->listProducts->execute(
                page: (int) ($validated['page'] ?? 1),
                perPage: (int) ($validated['per_page'] ?? 15),
                filters: [
                    'is_active' => $validated['is_active'] ?? null,
                    'search' => $validated['search'] ?? null,
                ]
            );

            return $this->paginated([
                'data' => array_map(fn($product) => [
                    'id' => $product->id(),
                    'name' => $product->name(),
                    'unit' => $product->unit()->value(),
                    'description' => $product->description(),
                    'is_active' => $product->isActive(),
                    'metadata' => $product->metadata(),
                    'current_rate' => $product->currentRate() ? [
                        'amount' => $product->currentRate()->amount()->amount(),
                        'currency' => $product->currentRate()->amount()->currency(),
                        'unit' => $product->currentRate()->unit()->value(),
                        'effective_date' => $product->currentRate()->effectiveDate()->format('Y-m-d'),
                    ] : null,
                    'created_at' => $product->createdAt()->format('Y-m-d H:i:s'),
                    'updated_at' => $product->updatedAt()->format('Y-m-d H:i:s'),
                ], $result['data']),
                'total' => $result['total'],
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'last_page' => $result['last_page'],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to list products: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a single product by ID.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $product = $this->getProduct->execute($id);

            return $this->success([
                'id' => $product->id(),
                'name' => $product->name(),
                'unit' => $product->unit()->value(),
                'description' => $product->description(),
                'is_active' => $product->isActive(),
                'metadata' => $product->metadata(),
                'current_rate' => $product->currentRate() ? [
                    'amount' => $product->currentRate()->amount()->amount(),
                    'currency' => $product->currentRate()->amount()->currency(),
                    'unit' => $product->currentRate()->unit()->value(),
                    'effective_date' => $product->currentRate()->effectiveDate()->format('Y-m-d'),
                ] : null,
                'created_at' => $product->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $product->updatedAt()->format('Y-m-d H:i:s'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Product not found: ' . $e->getMessage(), 404);
        }
    }

    /**
     * Create a new product.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|in:kg,g,l,ml,unit,dozen',
            'description' => 'nullable|string|max:1000',
            'metadata' => 'nullable|array',
        ]);

        try {
            $dto = CreateProductDTO::fromArray([
                'name' => $validated['name'],
                'unit' => $validated['unit'],
                'description' => $validated['description'] ?? null,
                'metadata' => $validated['metadata'] ?? [],
                'is_active' => true,
            ]);

            $product = $this->createProduct->execute($dto);

            return $this->created([
                'id' => $product->id(),
                'name' => $product->name(),
                'unit' => $product->unit()->value(),
                'description' => $product->description(),
                'is_active' => $product->isActive(),
                'metadata' => $product->metadata(),
                'created_at' => $product->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $product->updatedAt()->format('Y-m-d H:i:s'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to create product: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'unit' => 'string|in:kg,g,l,ml,unit,dozen',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array',
        ]);

        try {
            $dto = UpdateProductDTO::fromArray($validated);
            $product = $this->updateProduct->execute($id, $dto);

            return $this->success([
                'id' => $product->id(),
                'name' => $product->name(),
                'unit' => $product->unit()->value(),
                'description' => $product->description(),
                'is_active' => $product->isActive(),
                'metadata' => $product->metadata(),
                'current_rate' => $product->currentRate() ? [
                    'amount' => $product->currentRate()->amount()->amount(),
                    'currency' => $product->currentRate()->amount()->currency(),
                    'unit' => $product->currentRate()->unit()->value(),
                    'effective_date' => $product->currentRate()->effectiveDate()->format('Y-m-d'),
                ] : null,
                'created_at' => $product->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $product->updatedAt()->format('Y-m-d H:i:s'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to update product: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Delete a product.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->deleteProduct->execute($id);
            return $this->noContent();
        } catch (\Exception $e) {
            return $this->error('Failed to delete product: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Add a new rate to a product.
     */
    public function addRate(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'unit' => 'required|string|in:kg,g,l,ml,unit,dozen',
            'effective_date' => 'required|date',
        ]);

        try {
            $product = $this->addProductRate->execute(
                productId: $id,
                amount: (float) $validated['amount'],
                currency: $validated['currency'],
                unit: $validated['unit'],
                effectiveDate: new \DateTimeImmutable($validated['effective_date'])
            );

            return $this->success([
                'id' => $product->id(),
                'name' => $product->name(),
                'current_rate' => [
                    'amount' => $product->currentRate()->amount()->amount(),
                    'currency' => $product->currentRate()->amount()->currency(),
                    'unit' => $product->currentRate()->unit()->value(),
                    'effective_date' => $product->currentRate()->effectiveDate()->format('Y-m-d'),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to add product rate: ' . $e->getMessage(), 422);
        }
    }
}
