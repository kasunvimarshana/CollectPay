<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SuppliersPolicyTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return $user->createToken('t')->plainTextToken;
    }

    public function test_non_privileged_user_gets_only_allowed_suppliers(): void
    {
        $s1 = Supplier::factory()->create();
        $s2 = Supplier::factory()->create();

        $user = User::create([
            'name' => 'U',
            'email' => 'u@example.com',
            'password' => Hash::make('password123'),
            'attributes' => [
                'allowed_supplier_ids' => [(string)$s1->id],
            ],
        ]);

        $token = $this->tokenFor($user);
        $res = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/suppliers');

        $res->assertOk();
        $ids = collect($res->json('data'))->pluck('id');
        $this->assertTrue($ids->contains((string)$s1->id));
        $this->assertFalse($ids->contains((string)$s2->id));
    }

    public function test_manager_can_create_supplier(): void
    {
        $role = Role::create(['name' => 'manager']);
        $user = User::create([
            'name' => 'M',
            'email' => 'm@example.com',
            'password' => Hash::make('password123'),
        ]);
        $user->roles()->attach($role->id);
        $token = $this->tokenFor($user);

        $res = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/suppliers', [
                'name' => 'New Supplier',
                'phone' => null,
                'lat' => null,
                'lng' => null,
                'active' => true,
            ]);

        $res->assertCreated();
        $this->assertDatabaseHas('suppliers', ['name' => 'New Supplier']);
    }
}
