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
        Schema::create('sync_operations', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->index();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('entity_type'); // supplier, product, collection, payment, product_rate
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('operation_type'); // create, update, delete
            $table->string('local_id')->nullable(); // temporary ID from device
            $table->json('payload')->nullable();
            $table->string('status')->default('pending'); // pending, success, conflict, failed
            $table->json('conflict_data')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('attempted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['device_id', 'status']);
            $table->index(['entity_type', 'entity_id']);
            $table->index(['status', 'attempted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_operations');
    }
};
