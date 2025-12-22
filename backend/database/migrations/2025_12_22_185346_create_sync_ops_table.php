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
        Schema::create('sync_ops', function (Blueprint $table) {
            $table->uuid('op_id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('device_id');

            $table->string('entity');
            $table->string('type');
            $table->uuid('entity_id');

            $table->dateTime('received_at');
            $table->timestamps();

            $table->index(['user_id', 'device_id']);
            $table->index(['entity', 'entity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_ops');
    }
};
