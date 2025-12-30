<?php

namespace App\Http\Controllers\Api\V1;

use App\Application\DTOs\ProductDTO;
use App\Application\UseCases\Product\CreateProductUseCase;
use App\Application\UseCases\Product\UpdateProductUseCase;
use App\Application\UseCases\Product\GetProductUseCase;
use App\Application\UseCases\Product\ListProductsUseCase;
use App\Application\UseCases\Product\DeleteProductUseCase;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Product API Controller
 */
class ProductController extends Controller
{
    public function __construct(
        private CreateProductUseCase $createUseCase,
        private UpdateProductUseCase $updateUseCase,
        private GetProductUseCase $getUseCase,
        private ListProductsUseCase $listUseCase,
        private DeleteProductUseCase $deleteUseCase
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'is_active' => $request->get('is_active'),
            'search' => $request->get('search'),
        ];

        $page = (int) $request->get('page', 1);
        $perPage = (int) $request->get('per_page', 50);

        $result = $this->listUseCase->execute($filters, $page, $perPage);

        return response()->json([
            'data' => ProductResource::collection(collect($result['data']))->toArray($request),
            'meta' => $result['meta']
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $dto = ProductDTO::fromArray($request->validated());
        $product = $this->createUseCase->execute($dto);

        return response()->json(
            new ProductResource((object) $product->toArray()),
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $product = $this->getUseCase->execute($id);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json(
            new ProductResource((object) $product->toArray())
        );
    }

    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $dto = ProductDTO::fromArray($request->validated());
        $product = $this->updateUseCase->execute($id, $dto);

        return response()->json(
            new ProductResource((object) $product->toArray())
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->deleteUseCase->execute($id);

        return response()->json(null, 204);
    }
}
