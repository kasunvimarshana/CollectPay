<?php

namespace Tests\Unit\Domain\Entities;

use App\Domain\Entities\Collection;
use PHPUnit\Framework\TestCase;

/**
 * Collection Entity Unit Tests
 * 
 * Tests demonstrate Clean Architecture - entity logic tested in isolation.
 */
class CollectionTest extends TestCase
{
    public function test_creates_collection_with_valid_data(): void
    {
        $collection = new Collection(
            id: null,
            supplierId: 1,
            productId: 1,
            quantity: 10.5,
            unit: 'kg',
            rateApplied: 100.00,
            collectedAt: new \DateTimeImmutable(),
            createdBy: 1
        );

        $this->assertNull($collection->getId());
        $this->assertEquals(1, $collection->getSupplierId());
        $this->assertEquals(10.5, $collection->getQuantity());
        $this->assertEquals('kg', $collection->getUnit());
        $this->assertEquals(100.00, $collection->getRateApplied());
        $this->assertEquals(1050.00, $collection->getTotalValue());
    }

    public function test_calculates_total_value_automatically(): void
    {
        $collection = new Collection(
            null, 1, 1, 5.0, 'kg', 200.00,
            new \DateTimeImmutable(), 1
        );

        $this->assertEquals(1000.00, $collection->getTotalValue());
    }

    public function test_recalculates_total_when_quantity_changes(): void
    {
        $collection = new Collection(
            null, 1, 1, 5.0, 'kg', 100.00,
            new \DateTimeImmutable(), 1
        );

        $this->assertEquals(500.00, $collection->getTotalValue());

        $collection->setQuantity(10.0);
        $this->assertEquals(1000.00, $collection->getTotalValue());
    }

    public function test_throws_exception_for_negative_quantity(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Quantity must be positive');

        new Collection(
            null, 1, 1, -5.0, 'kg', 100.00,
            new \DateTimeImmutable(), 1
        );
    }

    public function test_throws_exception_for_zero_quantity(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        new Collection(
            null, 1, 1, 0, 'kg', 100.00,
            new \DateTimeImmutable(), 1
        );
    }

    public function test_throws_exception_for_negative_rate(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Rate cannot be negative');

        new Collection(
            null, 1, 1, 5.0, 'kg', -100.00,
            new \DateTimeImmutable(), 1
        );
    }

    public function test_throws_exception_for_invalid_unit(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid unit');

        new Collection(
            null, 1, 1, 5.0, 'invalid', 100.00,
            new \DateTimeImmutable(), 1
        );
    }

    public function test_to_array_returns_correct_structure(): void
    {
        $now = new \DateTimeImmutable();
        $collection = new Collection(
            1, 2, 3, 5.0, 'kg', 100.00, $now, 4
        );

        $array = $collection->toArray();

        $this->assertIsArray($array);
        $this->assertEquals(1, $array['id']);
        $this->assertEquals(2, $array['supplier_id']);
        $this->assertEquals(3, $array['product_id']);
        $this->assertEquals(5.0, $array['quantity']);
        $this->assertEquals('kg', $array['unit']);
        $this->assertEquals(100.00, $array['rate_applied']);
        $this->assertEquals(500.00, $array['total_value']);
        $this->assertEquals(4, $array['created_by']);
    }

    public function test_touch_updates_timestamp(): void
    {
        $collection = new Collection(
            1, 1, 1, 5.0, 'kg', 100.00,
            new \DateTimeImmutable(), 1
        );

        $originalUpdatedAt = $collection->getUpdatedAt();
        sleep(1);
        $collection->touch();
        $newUpdatedAt = $collection->getUpdatedAt();

        $this->assertGreaterThan(
            $originalUpdatedAt->getTimestamp(),
            $newUpdatedAt->getTimestamp()
        );
    }
}
