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
            $table->string('entity_type'); // supplier, product, rate, collection, payment
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('operation'); // create, update, delete
            $table->json('payload');
            $table->string('client_uuid')->nullable();
            $table->string('device_id')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('pending'); // pending, processing, completed, failed, conflict
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            $table->index(['entity_type', 'entity_id']);
            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'device_id']);
            $table->index('client_uuid');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_queue');
    }
};
