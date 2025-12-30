<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use App\Models\User;

abstract class TestCase extends BaseTestCase
{
    /**
     * Create an authenticated user and return the JWT token
     */
    protected function actingAsUser(?User $user = null): string
    {
        $user = $user ?? User::factory()->create();
        return auth('api')->login($user);
    }

    /**
     * Get authentication headers with JWT token
     */
    protected function authenticatedHeaders(?User $user = null): array
    {
        $token = $this->actingAsUser($user);
        return ['Authorization' => 'Bearer ' . $token];
    }
}
