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
        Schema::create('change_logs', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->string('model');
            $table->uuid('model_id');
            $table->string('operation');
            $table->unsignedBigInteger('version');
            $table->json('payload')->nullable();

            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->uuid('device_id')->nullable();

            $table->dateTime('changed_at');

            $table->timestamps();

            $table->index(['model', 'model_id']);
            $table->index(['changed_at']);
            $table->index(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('change_logs');
    }
};
