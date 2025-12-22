<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_and_logout_flow(): void
    {
        $user = User::create([
            'name' => 'Alice',
            'email' => 'alice@example.com',
            'password' => Hash::make('secret12345'),
        ]);

        $res = $this->postJson('/api/v1/auth/login', [
            'email' => 'alice@example.com',
            'password' => 'secret12345',
        ]);

        $res->assertOk();
        $token = $res->json('token');
        $this->assertIsString($token);

        $logout = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');
        $logout->assertOk()->assertJson(['ok' => true]);
    }
}
