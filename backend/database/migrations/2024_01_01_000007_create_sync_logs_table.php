<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sync_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('device_id');
            $table->string('entity_type'); // supplier, product, collection, payment, etc.
            $table->string('operation'); // create, update, delete
            $table->uuid('entity_id');
            $table->timestamp('client_timestamp');
            $table->json('payload')->nullable();
            $table->enum('status', ['pending', 'success', 'conflict', 'error'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'created_at']);
            $table->index('entity_type');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_logs');
    }
};
