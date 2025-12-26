<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Users Table Migration
 * 
 * Creates the users table with RBAC/ABAC support and optimistic locking.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->json('roles')->nullable(); // RBAC: admin, manager, collector
            $table->json('permissions')->nullable(); // ABAC: fine-grained permissions
            $table->boolean('is_active')->default(true);
            $table->integer('version')->default(0); // Optimistic locking
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('email');
            $table->index('is_active');
            $table->index(['is_active', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
