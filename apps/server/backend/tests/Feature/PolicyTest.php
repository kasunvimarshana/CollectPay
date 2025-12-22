<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Str;

class PolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_manager_can_update_user_in_same_department()
    {
        $manager = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Mgr', 'email' => 'mgr@example.com', 'password' => bcrypt('x'),
            'role' => 'manager', 'attributes' => ['department' => 'sales'],
        ]);
        $user = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'U', 'email' => 'u@example.com', 'password' => bcrypt('x'),
            'role' => 'user', 'attributes' => ['department' => 'sales'],
        ]);

        $this->actingAs($manager)->putJson('/api/users/'.$user->id, ['name' => 'U2', 'version' => 0])
            ->assertOk();
    }

    public function test_manager_cannot_update_user_in_other_department()
    {
        $manager = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Mgr', 'email' => 'mgr2@example.com', 'password' => bcrypt('x'),
            'role' => 'manager', 'attributes' => ['department' => 'sales'],
        ]);
        $user = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'U', 'email' => 'u2@example.com', 'password' => bcrypt('x'),
            'role' => 'user', 'attributes' => ['department' => 'marketing'],
        ]);

        $this->actingAs($manager)->putJson('/api/users/'.$user->id, ['name' => 'U2', 'version' => 0])
            ->assertForbidden();
    }
}
