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
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('entity_type'); // e.g., 'collection', 'payment', 'rate'
            $table->uuid('entity_uuid');
            $table->string('operation'); // e.g., 'create', 'update', 'delete'
            $table->json('data');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->integer('version')->default(1);
            $table->string('device_id');
            $table->timestamp('attempted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['entity_type', 'entity_uuid']);
            $table->index('device_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_queue');
    }
};
