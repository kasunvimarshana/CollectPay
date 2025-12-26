<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_user()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role' => 'collector',
            'is_active' => true
        ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'collector'
        ]);
        $this->assertEquals('Test User', $user->name);
        $this->assertTrue($user->is_active);
    }

    /** @test */
    public function it_hashes_password()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role' => 'collector',
            'is_active' => true
        ]);

        $this->assertTrue(Hash::check('password', $user->password));
    }

    /** @test */
    public function it_has_role_check_methods()
    {
        $adminUser = User::factory()->create(['role' => 'admin']);
        $managerUser = User::factory()->create(['role' => 'manager']);
        $collectorUser = User::factory()->create(['role' => 'collector']);

        $this->assertTrue($adminUser->isAdmin());
        $this->assertFalse($adminUser->isManager());
        $this->assertFalse($adminUser->isCollector());

        $this->assertTrue($managerUser->isManager());
        $this->assertFalse($managerUser->isAdmin());
        
        $this->assertTrue($collectorUser->isCollector());
        $this->assertFalse($collectorUser->isAdmin());
    }

    /** @test */
    public function it_has_role_method()
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->assertTrue($user->hasRole('admin'));
        $this->assertFalse($user->hasRole('collector'));
    }

    /** @test */
    public function it_soft_deletes()
    {
        $user = User::factory()->create();
        $userId = $user->id;

        $user->delete();

        $this->assertSoftDeleted('users', ['id' => $userId]);
    }

    /** @test */
    public function it_has_version_field()
    {
        $user = User::factory()->create();
        
        $this->assertEquals(0, $user->version);
        
        $user->increment('version');
        $user->refresh();
        
        $this->assertEquals(1, $user->version);
    }

    /** @test */
    public function password_is_hidden_in_array()
    {
        $user = User::factory()->create();
        $userArray = $user->toArray();

        $this->assertArrayNotHasKey('password', $userArray);
    }

    /** @test */
    public function it_casts_is_active_to_boolean()
    {
        $user = User::factory()->create(['is_active' => 1]);
        
        $this->assertIsBool($user->is_active);
        $this->assertTrue($user->is_active);
    }
}
