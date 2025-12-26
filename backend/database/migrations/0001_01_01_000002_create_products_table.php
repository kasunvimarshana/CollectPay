<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('primary_unit')->default('kg'); // kg, g, liter, piece, etc.
            $table->json('supported_units')->nullable(); // Array of supported units with conversion factors
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->nullable();
            
            // Sync fields
            $table->uuid('client_id')->nullable()->index();
            $table->bigInteger('version')->default(1);
            $table->timestamp('synced_at')->nullable();
            $table->boolean('is_dirty')->default(false);
            $table->string('sync_status')->default('synced');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['category', 'is_active']);
            $table->index(['synced_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
