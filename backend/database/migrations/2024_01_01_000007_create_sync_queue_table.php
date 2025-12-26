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
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->string('entity_type'); // transaction, payment, etc.
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('operation'); // create, update, delete
            $table->json('data');
            $table->string('hash')->unique();
            $table->enum('status', ['pending', 'synced', 'conflict', 'failed'])->default('pending');
            $table->integer('retry_count')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index(['device_id', 'status']);
            $table->index(['hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_queue');
    }
};
