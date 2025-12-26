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
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('device_id')->nullable(); // Device identifier
            $table->string('entity_type'); // suppliers, products, collections, payments
            $table->string('entity_uuid'); // UUID of the entity being synced
            $table->string('operation'); // create, update, delete
            $table->json('payload')->nullable(); // Data being synced
            $table->json('conflicts')->nullable(); // Detected conflicts
            $table->string('resolution')->nullable(); // How conflict was resolved
            $table->string('status'); // pending, success, failed, conflict
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['entity_type', 'entity_uuid']);
            $table->index('status');
            $table->index('created_at');
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
