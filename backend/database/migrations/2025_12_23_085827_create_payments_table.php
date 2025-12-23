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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('payment_number')->unique();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('collection_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['advance', 'partial', 'full', 'adjustment'])->default('partial');
            $table->decimal('amount', 12, 2);
            $table->timestamp('payment_date');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'mobile_money', 'check'])->default('cash');
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->foreignId('processed_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
            
            // For offline sync
            $table->timestamp('synced_at')->nullable();
            $table->string('device_id')->nullable();
            $table->unsignedBigInteger('version')->default(1);
            $table->timestamp('client_created_at')->nullable();
            
            $table->index(['supplier_id', 'payment_date']);
            $table->index(['uuid', 'synced_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
