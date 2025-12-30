<?php

namespace Tests\Unit\Domain\ValueObjects;

use App\Domain\ValueObjects\Quantity;
use PHPUnit\Framework\TestCase;

/**
 * Quantity Value Object Unit Tests
 */
class QuantityTest extends TestCase
{
    public function test_creates_quantity_with_valid_values(): void
    {
        $quantity = Quantity::from(5.0, 'kg');

        $this->assertEquals(5.0, $quantity->value());
        $this->assertEquals('kg', $quantity->unit());
    }

    public function test_throws_exception_for_zero_or_negative_value(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Quantity must be positive');

        Quantity::from(-5.0, 'kg');
    }

    public function test_throws_exception_for_invalid_unit(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid unit');

        Quantity::from(5.0, 'invalid');
    }

    public function test_converts_to_base_unit(): void
    {
        $quantity = Quantity::from(1, 'kg');
        $this->assertEquals(1000, $quantity->toBaseUnit());

        $quantity2 = Quantity::from(5, 'g');
        $this->assertEquals(5, $quantity2->toBaseUnit());
    }

    public function test_converts_between_units(): void
    {
        $quantity = Quantity::from(1, 'kg');
        $converted = $quantity->convertTo('g');

        $this->assertEquals(1000, $converted->value());
        $this->assertEquals('g', $converted->unit());
    }

    public function test_adds_quantities_with_different_units(): void
    {
        $quantity1 = Quantity::from(1, 'kg');
        $quantity2 = Quantity::from(500, 'g');

        $result = $quantity1->add($quantity2);

        $this->assertEquals(1.5, $result->value());
        $this->assertEquals('kg', $result->unit());
    }

    public function test_checks_equality(): void
    {
        $quantity1 = Quantity::from(1, 'kg');
        $quantity2 = Quantity::from(1000, 'g');
        $quantity3 = Quantity::from(2, 'kg');

        $this->assertTrue($quantity1->equals($quantity2));
        $this->assertFalse($quantity1->equals($quantity3));
    }

    public function test_formats_quantity(): void
    {
        $quantity = Quantity::from(5.5, 'kg');

        $this->assertEquals('5.50 kg', $quantity->format());
        $this->assertEquals('5.50 kg', (string) $quantity);
    }
}
