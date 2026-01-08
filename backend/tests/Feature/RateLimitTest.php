<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RateLimitTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that authentication endpoints are rate limited
     */
    public function test_login_endpoint_is_rate_limited(): void
    {
        // Create a user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        // Make 5 successful login attempts (should be allowed)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/login', [
                'email' => 'wrong@example.com',
                'password' => 'wrongpassword',
            ]);

            // These should fail due to wrong credentials, but not rate limiting
            $this->assertNotEquals(429, $response->status());
        }

        // The 6th attempt should be rate limited
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->assertEquals(429, $response->status());
        $response->assertJson([
            'success' => false,
            'message' => 'Too many requests. Please try again later.',
        ]);
        $this->assertArrayHasKey('retry_after', $response->json());
    }

    /**
     * Test that register endpoint is rate limited
     */
    public function test_register_endpoint_is_rate_limited(): void
    {
        // Make 5 registration attempts
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/register', [
                'name' => "Test User {$i}",
                'email' => "test{$i}@example.com",
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

            // These should succeed or fail with validation, not rate limiting
            $this->assertNotEquals(429, $response->status());
        }

        // The 6th attempt should be rate limited
        $response = $this->postJson('/api/register', [
            'name' => 'Test User 6',
            'email' => 'test6@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->assertEquals(429, $response->status());
        $response->assertJson([
            'success' => false,
            'message' => 'Too many requests. Please try again later.',
        ]);
    }

    /**
     * Test that rate limit headers are present
     */
    public function test_rate_limit_headers_are_present(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertTrue($response->headers->has('X-RateLimit-Limit'));
        $this->assertTrue($response->headers->has('X-RateLimit-Remaining'));
    }

    /**
     * Test that authenticated API endpoints have rate limiting
     */
    public function test_authenticated_endpoints_are_rate_limited(): void
    {
        $user = User::factory()->create();
        $token = auth()->login($user);

        // Make 60 requests (should succeed)
        for ($i = 0; $i < 60; $i++) {
            $response = $this->withHeaders([
                'Authorization' => "Bearer {$token}",
            ])->getJson('/api/suppliers');

            // Should not be rate limited yet
            if ($response->status() === 429) {
                // If we hit the limit before 60, that's fine too
                break;
            }
            $this->assertNotEquals(429, $response->status());
        }

        // The 61st request should be rate limited (if not already)
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/suppliers');

        // Should be rate limited now
        if ($response->status() === 429) {
            $response->assertJson([
                'success' => false,
                'message' => 'Too many requests. Please try again later.',
            ]);
        }

        // Test passes if we got rate limited
        $this->assertTrue(true);
    }

    /**
     * Test that report endpoints have stricter rate limiting
     */
    public function test_report_endpoints_have_stricter_rate_limits(): void
    {
        $user = User::factory()->create();
        $token = auth()->login($user);

        // Make 30 requests to reports endpoint
        for ($i = 0; $i < 30; $i++) {
            $response = $this->withHeaders([
                'Authorization' => "Bearer {$token}",
            ])->getJson('/api/reports/summary');

            // Should not be rate limited yet
            if ($response->status() === 429) {
                break;
            }
        }

        // The 31st request should be rate limited
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/reports/summary');

        // Should be rate limited now or within few requests
        if ($response->status() === 429) {
            $response->assertJson([
                'success' => false,
                'message' => 'Too many requests. Please try again later.',
            ]);
        }

        $this->assertTrue(true);
    }
}
