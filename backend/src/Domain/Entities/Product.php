<?php

namespace App\Domain\Entities;

/**
 * Product Entity
 * 
 * Represents a product with rate versioning support.
 */
class Product
{
    private ?int $id;
    private string $name;
    private string $unit;
    private float $currentRate;
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;

    public function __construct(
        ?int $id,
        string $name,
        string $unit,
        float $currentRate,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null
    ) {
        $this->id = $id;
        $this->setName($name);
        $this->setUnit($unit);
        $this->setCurrentRate($currentRate);
        $this->createdAt = $createdAt ?? new \DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        if (empty($name)) {
            throw new \InvalidArgumentException('Product name cannot be empty');
        }
        $this->name = $name;
    }

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function setUnit(string $unit): void
    {
        $validUnits = ['kg', 'g', 'lb', 'oz', 'l', 'ml', 'unit'];
        if (!in_array($unit, $validUnits)) {
            throw new \InvalidArgumentException('Invalid unit');
        }
        $this->unit = $unit;
    }

    public function getCurrentRate(): float
    {
        return $this->currentRate;
    }

    public function setCurrentRate(float $rate): void
    {
        if ($rate < 0) {
            throw new \InvalidArgumentException('Rate cannot be negative');
        }
        $this->currentRate = $rate;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function touch(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'unit' => $this->unit,
            'current_rate' => $this->currentRate,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
