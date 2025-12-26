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
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->enum('payment_type', ['advance', 'partial', 'full', 'adjustment'])->default('partial');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'mobile_money', 'other'])->default('cash');
            $table->string('reference_number')->nullable();
            $table->timestamp('payment_date');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('completed');
            $table->enum('sync_status', ['synced', 'pending', 'failed'])->default('synced');
            $table->bigInteger('version')->default(1);
            $table->json('metadata')->nullable();
            $table->foreignId('paid_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['supplier_id', 'payment_date']);
            $table->index(['status', 'sync_status']);
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
