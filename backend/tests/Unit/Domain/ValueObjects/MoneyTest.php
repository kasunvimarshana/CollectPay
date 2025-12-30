<?php

namespace Tests\Unit\Domain\ValueObjects;

use App\Domain\ValueObjects\Money;
use PHPUnit\Framework\TestCase;

/**
 * Money Value Object Unit Tests
 * 
 * Tests immutable value object behavior.
 */
class MoneyTest extends TestCase
{
    public function test_creates_money_with_valid_amount(): void
    {
        $money = Money::from(100.50, 'USD');

        $this->assertEquals(100.50, $money->amount());
        $this->assertEquals('USD', $money->currency());
    }

    public function test_rounds_to_two_decimal_places(): void
    {
        $money = Money::from(100.567, 'USD');

        $this->assertEquals(100.57, $money->amount());
    }

    public function test_throws_exception_for_negative_amount(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Amount cannot be negative');

        Money::from(-100, 'USD');
    }

    public function test_adds_money_with_same_currency(): void
    {
        $money1 = Money::from(100, 'USD');
        $money2 = Money::from(50, 'USD');

        $result = $money1->add($money2);

        $this->assertEquals(150, $result->amount());
        $this->assertEquals('USD', $result->currency());
    }

    public function test_throws_exception_when_adding_different_currencies(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Cannot operate on different currencies');

        $money1 = Money::from(100, 'USD');
        $money2 = Money::from(50, 'EUR');

        $money1->add($money2);
    }

    public function test_subtracts_money(): void
    {
        $money1 = Money::from(100, 'USD');
        $money2 = Money::from(30, 'USD');

        $result = $money1->subtract($money2);

        $this->assertEquals(70, $result->amount());
    }

    public function test_multiplies_money(): void
    {
        $money = Money::from(50, 'USD');

        $result = $money->multiply(3);

        $this->assertEquals(150, $result->amount());
    }

    public function test_compares_money(): void
    {
        $money1 = Money::from(100, 'USD');
        $money2 = Money::from(50, 'USD');
        $money3 = Money::from(100, 'USD');

        $this->assertTrue($money1->isGreaterThan($money2));
        $this->assertTrue($money2->isLessThan($money1));
        $this->assertTrue($money1->equals($money3));
    }

    public function test_formats_money_correctly(): void
    {
        $money = Money::from(1234.56, 'USD');

        $this->assertEquals('USD 1234.56', $money->format());
        $this->assertEquals('USD 1234.56', (string) $money);
    }

    public function test_money_is_immutable(): void
    {
        $original = Money::from(100, 'USD');
        $modified = $original->add(Money::from(50, 'USD'));

        // Original should remain unchanged
        $this->assertEquals(100, $original->amount());
        $this->assertEquals(150, $modified->amount());
    }
}
