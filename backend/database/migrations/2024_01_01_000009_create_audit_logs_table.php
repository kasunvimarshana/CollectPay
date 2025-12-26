<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for audit_logs table
 * 
 * Stores comprehensive audit trail of all entity operations
 * for compliance, debugging, and change tracking purposes.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            
            // What entity was affected
            $table->string('entity_type', 50); // 'collection', 'payment', 'supplier', etc.
            $table->unsignedBigInteger('entity_id');
            $table->uuid('entity_uuid')->nullable();
            
            // What happened
            $table->string('action', 20); // 'created', 'updated', 'deleted', 'synced'
            
            // Who did it
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('user_role')->nullable();
            
            // What changed
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('changed_fields')->nullable();
            
            // Context information
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('device_id')->nullable();
            $table->string('sync_session_id')->nullable();
            
            // Additional metadata
            $table->json('metadata')->nullable();
            $table->text('reason')->nullable();
            
            $table->timestamps();
            
            // Indexes for efficient querying
            $table->index('entity_type');
            $table->index(['entity_type', 'entity_id']);
            $table->index('action');
            $table->index('user_id');
            $table->index('created_at');
            $table->index('sync_session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
