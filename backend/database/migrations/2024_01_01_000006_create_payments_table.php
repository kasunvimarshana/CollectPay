<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('payment_reference')->unique();
            $table->foreignId('collection_id')->constrained()->onDelete('cascade');
            $table->foreignId('rate_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('payer_id')->constrained('users');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->enum('payment_method', ['cash', 'card', 'bank_transfer', 'mobile_money', 'other']);
            $table->text('notes')->nullable();
            $table->timestamp('payment_date');
            $table->timestamp('processed_at')->nullable();
            $table->boolean('is_automated')->default(false);
            $table->json('metadata')->nullable();
            $table->integer('version')->default(1);
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamp('synced_at')->nullable();
            $table->string('device_id')->nullable();
            $table->string('idempotency_key')->unique();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['uuid', 'version']);
            $table->index('payment_reference');
            $table->index('status');
            $table->index('synced_at');
            $table->index('idempotency_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
