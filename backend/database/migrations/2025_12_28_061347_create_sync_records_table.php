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
        Schema::create('sync_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('device_id');
            $table->uuid('user_id');
            $table->string('entity_type', 50);
            $table->uuid('entity_id');
            $table->enum('operation', ['create', 'update', 'delete']);
            $table->json('data');
            $table->timestamp('client_timestamp');
            $table->timestamp('server_timestamp')->nullable();
            $table->enum('status', ['pending', 'processed', 'conflict', 'rejected'])->default('pending');
            $table->text('conflict_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['device_id', 'status']);
            $table->index(['entity_type', 'entity_id']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_records');
    }
};
