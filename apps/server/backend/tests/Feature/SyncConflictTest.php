<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Str;

class SyncConflictTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_update_conflict_returns_409_and_server_state()
    {
        $admin = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Admin', 'email' => 'a@example.com', 'password' => bcrypt('x'),
            'role' => 'admin', 'attributes' => ['department' => 'hq'], 'version' => 0
        ]);
        $target = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'T', 'email' => 't@example.com', 'password' => bcrypt('x'),
            'role' => 'user', 'attributes' => ['department' => 'hq'], 'version' => 1
        ]);

        // Client thinks version is 0, server is at 1
        $this->actingAs($admin)
            ->putJson('/api/users/'.$target->id, ['name' => 'T2', 'version' => 0])
            ->assertStatus(409)
            ->assertJsonStructure(['id','name','email','role','version']);
    }
}
