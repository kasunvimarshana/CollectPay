<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rates', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('rate_type'); // e.g., 'monthly', 'annual', 'one-time'
            $table->foreignId('collection_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('version')->default(1);
            $table->timestamp('effective_from');
            $table->timestamp('effective_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamp('synced_at')->nullable();
            $table->string('device_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['uuid', 'version']);
            $table->index(['effective_from', 'effective_until']);
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rates');
    }
};
