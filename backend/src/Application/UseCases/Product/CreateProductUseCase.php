<?php

declare(strict_types=1);

namespace Application\UseCases\Product;

use Application\DTOs\CreateProductDTO;
use Domain\Entities\Product;
use Domain\Repositories\ProductRepositoryInterface;
use InvalidArgumentException;

final class CreateProductUseCase
{
    public function __construct(
        private ProductRepositoryInterface $repository
    ) {}

    public function execute(CreateProductDTO $dto): Product
    {
        // Check if code already exists
        if ($this->repository->codeExists($dto->code)) {
            throw new InvalidArgumentException('This product code already exists');
        }

        $product = Product::create(
            $dto->name,
            $dto->code,
            $dto->unit,
            $dto->description
        );

        $this->repository->save($product);

        return $product;
    }
}
