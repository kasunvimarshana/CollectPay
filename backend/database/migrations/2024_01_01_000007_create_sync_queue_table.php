<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sync_queue', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type'); // collection, payment, supplier, etc.
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('client_uuid')->unique();
            $table->string('device_id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('data'); // The actual entity data
            $table->enum('operation', ['create', 'update', 'delete'])->default('create');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'conflict'])->default('pending');
            $table->integer('retry_count')->default(0);
            $table->text('error_message')->nullable();
            $table->json('conflict_data')->nullable(); // Data for conflict resolution
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'device_id']);
            $table->index('client_uuid');
            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_queue');
    }
};
