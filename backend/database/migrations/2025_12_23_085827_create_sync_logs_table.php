<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sync_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('device_id');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('entity_type'); // suppliers, products, collections, etc.
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('entity_uuid')->nullable();
            $table->enum('action', ['create', 'update', 'delete']);
            $table->enum('status', ['pending', 'success', 'failed', 'conflict'])->default('pending');
            $table->json('data')->nullable(); // Synced data
            $table->json('conflict_data')->nullable(); // Conflict information
            $table->text('error_message')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
            
            $table->index(['device_id', 'entity_type', 'status']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_logs');
    }
};
