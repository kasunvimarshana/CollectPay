<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');
            $table->json('metadata')->nullable();
            $table->integer('version')->default(1);
            $table->timestamp('synced_at')->nullable();
            $table->string('device_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['uuid', 'version']);
            $table->index('synced_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
