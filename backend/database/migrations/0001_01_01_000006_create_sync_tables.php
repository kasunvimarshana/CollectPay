<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Sync log for audit trail and conflict tracking
        Schema::create('sync_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('device_id');
            $table->string('entity_type');
            $table->uuid('entity_id');
            $table->string('action'); // create, update, delete
            $table->json('payload')->nullable();
            $table->json('conflicts')->nullable();
            $table->string('resolution')->nullable(); // server_wins, client_wins, merged
            $table->bigInteger('client_version');
            $table->bigInteger('server_version');
            $table->string('status'); // pending, processed, failed, conflict
            $table->text('error_message')->nullable();
            $table->string('checksum')->nullable(); // For tamper detection
            $table->timestamp('client_timestamp');
            $table->timestamps();
            
            $table->index(['entity_type', 'entity_id']);
            $table->index(['device_id', 'created_at']);
            $table->index(['status']);
        });

        // Sync state tracking per device
        Schema::create('sync_states', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_id');
            $table->string('entity_type');
            $table->timestamp('last_sync_at');
            $table->bigInteger('last_sync_version')->default(0);
            $table->string('sync_token')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'device_id', 'entity_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_states');
        Schema::dropIfExists('sync_logs');
    }
};
