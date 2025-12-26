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
        Schema::create('sync_queue', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('entity_type'); // 'supplier', 'product', 'collection', 'payment', 'rate'
            $table->string('entity_uuid');
            $table->enum('operation', ['create', 'update', 'delete']);
            $table->json('payload'); // The data to sync
            $table->string('payload_signature'); // HMAC signature for tamper detection
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->integer('retry_count')->default(0);
            $table->timestamp('last_retry_at')->nullable();
            $table->text('error_message')->nullable();
            $table->bigInteger('client_version');
            $table->bigInteger('server_version')->nullable();
            $table->string('device_id')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['entity_type', 'entity_uuid']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_queue');
    }
};
