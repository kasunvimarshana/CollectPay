<?php

namespace LedgerFlow\Presentation\Controllers;

use LedgerFlow\Application\UseCases\CreateProduct;
use LedgerFlow\Domain\Repositories\ProductRepositoryInterface;
use LedgerFlow\Domain\Repositories\ProductRateRepositoryInterface;
use LedgerFlow\Domain\Entities\ProductRate;

class ProductController
{
    private ProductRepositoryInterface $productRepository;
    private ProductRateRepositoryInterface $productRateRepository;
    private CreateProduct $createProduct;

    public function __construct(
        ProductRepositoryInterface $productRepository,
        ProductRateRepositoryInterface $productRateRepository,
        CreateProduct $createProduct
    ) {
        $this->productRepository = $productRepository;
        $this->productRateRepository = $productRateRepository;
        $this->createProduct = $createProduct;
    }

    public function index(): void
    {
        try {
            $products = $this->productRepository->findAll();
            $productsData = array_map(function ($product) {
                return [
                    'id' => $product->getId(),
                    'name' => $product->getName(),
                    'description' => $product->getDescription(),
                    'unit' => $product->getUnit(),
                    'created_at' => $product->getCreatedAt()->format('Y-m-d H:i:s'),
                    'updated_at' => $product->getUpdatedAt()->format('Y-m-d H:i:s')
                ];
            }, $products);

            http_response_code(200);
            echo json_encode($productsData);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function show(string $id): void
    {
        try {
            $product = $this->productRepository->findById($id);

            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                return;
            }

            // Get rate history
            $rates = $this->productRateRepository->findByProductId($id);
            $ratesData = array_map(function ($rate) {
                return [
                    'id' => $rate->getId(),
                    'rate' => $rate->getRate(),
                    'effective_date' => $rate->getEffectiveDate()->format('Y-m-d'),
                    'created_at' => $rate->getCreatedAt()->format('Y-m-d H:i:s')
                ];
            }, $rates);

            http_response_code(200);
            echo json_encode([
                'id' => $product->getId(),
                'name' => $product->getName(),
                'description' => $product->getDescription(),
                'unit' => $product->getUnit(),
                'rates' => $ratesData,
                'created_at' => $product->getCreatedAt()->format('Y-m-d H:i:s'),
                'updated_at' => $product->getUpdatedAt()->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function store(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $product = $this->createProduct->execute($data);

            // If initial rate is provided, create it
            if (isset($data['initial_rate'])) {
                $rate = new ProductRate(
                    uniqid('rate_', true),
                    $product->getId(),
                    (float)$data['initial_rate'],
                    new \DateTime()
                );
                $this->productRateRepository->save($rate);
            }

            http_response_code(201);
            echo json_encode([
                'id' => $product->getId(),
                'name' => $product->getName(),
                'description' => $product->getDescription(),
                'unit' => $product->getUnit(),
                'created_at' => $product->getCreatedAt()->format('Y-m-d H:i:s')
            ]);
        } catch (\InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function update(string $id): void
    {
        try {
            $product = $this->productRepository->findById($id);

            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            if (isset($data['name'])) {
                $product->setName($data['name']);
            }
            if (isset($data['description'])) {
                $product->setDescription($data['description']);
            }
            if (isset($data['unit'])) {
                $product->setUnit($data['unit']);
            }

            $product->setUpdatedAt(new \DateTime());
            $product->incrementVersion();

            $this->productRepository->save($product);

            http_response_code(200);
            echo json_encode([
                'id' => $product->getId(),
                'name' => $product->getName(),
                'description' => $product->getDescription(),
                'unit' => $product->getUnit(),
                'updated_at' => $product->getUpdatedAt()->format('Y-m-d H:i:s')
            ]);
        } catch (\RuntimeException $e) {
            http_response_code(409);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function delete(string $id): void
    {
        try {
            $product = $this->productRepository->findById($id);

            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                return;
            }

            $this->productRepository->delete($id);

            http_response_code(204);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function addRate(string $id): void
    {
        try {
            $product = $this->productRepository->findById($id);

            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['rate']) || $data['rate'] < 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Valid rate is required']);
                return;
            }

            $effectiveDate = isset($data['effective_date'])
                ? new \DateTime($data['effective_date'])
                : new \DateTime();

            $rate = new ProductRate(
                uniqid('rate_', true),
                $id,
                (float)$data['rate'],
                $effectiveDate
            );

            $this->productRateRepository->save($rate);

            http_response_code(201);
            echo json_encode([
                'id' => $rate->getId(),
                'product_id' => $rate->getProductId(),
                'rate' => $rate->getRate(),
                'effective_date' => $rate->getEffectiveDate()->format('Y-m-d'),
                'created_at' => $rate->getCreatedAt()->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }
}
